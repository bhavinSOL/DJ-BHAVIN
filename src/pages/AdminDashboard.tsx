import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Music, Upload, LogOut, Trash2, Edit, Save, X, Calendar, Folder } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CategoryManager } from '@/components/CategoryManager';

interface Song {
  id: string;
  title: string;
  artist: string;
  album?: string;
  file_url: string;
  cover_image_url?: string;
  duration: number;
  like_count?: number;
  play_count?: number;
  category_id?: string;
  created_at: string;
}

const AdminDashboard = () => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingSong, setEditingSong] = useState<string | null>(null);
  const [uploadForm, setUploadForm] = useState({
    title: '',
    artist: '',
    album: '',
    duration: 0
  });
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
    fetchSongs();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/admin');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin');
  };

  const fetchSongs = async () => {
    try {
      const { data, error } = await supabase
        .from('songs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSongs(data || []);
    } catch (error) {
      console.error('Error fetching songs:', error);
      toast({
        title: "Error",
        description: "Failed to load songs",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const uploadFile = async (file: File, bucket: string): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file);

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);

    return publicUrl;
  };

  const getAudioDuration = (file: File): Promise<number> => {
    return new Promise((resolve) => {
      const audio = new Audio();
      audio.onloadedmetadata = () => {
        resolve(audio.duration);
      };
      audio.src = URL.createObjectURL(file);
    });
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!audioFile) {
      toast({
        title: "Error",
        description: "Please select an audio file",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    try {
      // Upload audio file
      const audioUrl = await uploadFile(audioFile, 'songs');
      
      // Upload cover image if provided
      let coverUrl = null;
      if (coverFile) {
        coverUrl = await uploadFile(coverFile, 'covers');
      }

      // Get audio duration
      const duration = await getAudioDuration(audioFile);

      // Insert song record
      const { error } = await supabase
        .from('songs')
        .insert({
          title: uploadForm.title,
          artist: uploadForm.artist,
          album: uploadForm.album || null,
          file_url: audioUrl,
          cover_image_url: coverUrl,
          duration: Math.floor(duration)
        });

      if (error) throw error;

      toast({
        title: "Song uploaded successfully!",
        description: `${uploadForm.title} by ${uploadForm.artist}`
      });

      // Reset form
      setUploadForm({ title: '', artist: '', album: '', duration: 0 });
      setAudioFile(null);
      setCoverFile(null);
      
      // Refresh songs list
      await fetchSongs();
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload song",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteSong = async (songId: string) => {
    if (!confirm('Are you sure you want to delete this song?')) return;

    try {
      const { error } = await supabase
        .from('songs')
        .delete()
        .eq('id', songId);

      if (error) throw error;

      toast({
        title: "Song deleted successfully"
      });

      await fetchSongs();
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: "Error",
        description: "Failed to delete song",
        variant: "destructive"
      });
    }
  };

  const handleEditSong = async (song: Song, updatedData: Partial<Song>) => {
    try {
      const { error } = await supabase
        .from('songs')
        .update(updatedData)
        .eq('id', song.id);

      if (error) throw error;

      toast({
        title: "Song updated successfully"
      });

      setEditingSong(null);
      await fetchSongs();
    } catch (error) {
      console.error('Update error:', error);
      toast({
        title: "Error",
        description: "Failed to update song",
        variant: "destructive"
      });
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Get current week's songs
  const getCurrentWeekSongs = () => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    return songs.filter(song => {
      const songDate = new Date(song.created_at);
      return songDate >= oneWeekAgo;
    });
  };

  // Get older songs
  const getOlderSongs = () => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    return songs.filter(song => {
      const songDate = new Date(song.created_at);
      return songDate < oneWeekAgo;
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-music-gradient p-2 rounded-lg">
                <Music className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-music-gradient bg-clip-text text-transparent">
                Admin Dashboard
              </h1>
            </div>
            <Button onClick={handleLogout} variant="outline">
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Upload Form */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Upload New Song
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpload} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Song Title *</Label>
                  <Input
                    id="title"
                    value={uploadForm.title}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, title: e.target.value }))}
                    required
                    className="bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="artist">Artist *</Label>
                  <Input
                    id="artist"
                    value={uploadForm.artist}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, artist: e.target.value }))}
                    required
                    className="bg-background"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="album">Album (Optional)</Label>
                <Input
                  id="album"
                  value={uploadForm.album}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, album: e.target.value }))}
                  className="bg-background"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="audio">Audio File *</Label>
                  <Input
                    id="audio"
                    type="file"
                    accept="audio/*"
                    onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
                    required
                    className="bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cover">Cover Image (Optional)</Label>
                  <Input
                    id="cover"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
                    className="bg-background"
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="music"
                disabled={isUploading}
                className="w-full md:w-auto"
              >
                {isUploading ? 'Uploading...' : 'Upload Song'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Management Tabs */}
        <Tabs defaultValue="current-week" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="current-week" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              This Week ({getCurrentWeekSongs().length})
            </TabsTrigger>
            <TabsTrigger value="categories" className="flex items-center gap-2">
              <Folder className="w-4 h-4" />
              Categories
            </TabsTrigger>
            <TabsTrigger value="all-songs" className="flex items-center gap-2">
              <Music className="w-4 h-4" />
              All Songs ({songs.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="current-week">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  This Week's Songs ({getCurrentWeekSongs().length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading songs...</p>
                  </div>
                ) : getCurrentWeekSongs().length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No songs uploaded this week</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {getCurrentWeekSongs().map((song) => (
                      <SongManagementCard
                        key={song.id}
                        song={song}
                        isEditing={editingSong === song.id}
                        onEdit={() => setEditingSong(song.id)}
                        onCancelEdit={() => setEditingSong(null)}
                        onSave={(updatedData) => handleEditSong(song, updatedData)}
                        onDelete={() => handleDeleteSong(song.id)}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categories">
            <CategoryManager songs={songs} onSongUpdate={fetchSongs} />
          </TabsContent>

          <TabsContent value="all-songs">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Music className="w-5 h-5" />
                  All Songs ({songs.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading songs...</p>
                  </div>
                ) : songs.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Music className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No songs uploaded yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {songs.map((song) => (
                      <SongManagementCard
                        key={song.id}
                        song={song}
                        isEditing={editingSong === song.id}
                        onEdit={() => setEditingSong(song.id)}
                        onCancelEdit={() => setEditingSong(null)}
                        onSave={(updatedData) => handleEditSong(song, updatedData)}
                        onDelete={() => handleDeleteSong(song.id)}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

interface SongManagementCardProps {
  song: Song;
  isEditing: boolean;
  onEdit: () => void;
  onCancelEdit: () => void;
  onSave: (data: Partial<Song>) => void;
  onDelete: () => void;
}

const SongManagementCard = ({ song, isEditing, onEdit, onCancelEdit, onSave, onDelete }: SongManagementCardProps) => {
  const [editData, setEditData] = useState({
    title: song.title,
    artist: song.artist,
    album: song.album || ''
  });

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleSave = () => {
    onSave({
      title: editData.title,
      artist: editData.artist,
      album: editData.album || null
    });
  };

  return (
    <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
      <img
        src={song.cover_image_url || '/placeholder.svg'}
        alt={song.title}
        className="w-16 h-16 rounded-md object-cover"
      />
      
      <div className="flex-1 space-y-2">
        {isEditing ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <Input
              value={editData.title}
              onChange={(e) => setEditData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Title"
              className="bg-background"
            />
            <Input
              value={editData.artist}
              onChange={(e) => setEditData(prev => ({ ...prev, artist: e.target.value }))}
              placeholder="Artist"
              className="bg-background"
            />
            <Input
              value={editData.album}
              onChange={(e) => setEditData(prev => ({ ...prev, album: e.target.value }))}
              placeholder="Album"
              className="bg-background"
            />
          </div>
        ) : (
          <>
            <h3 className="font-semibold">{song.title}</h3>
            <p className="text-sm text-muted-foreground">{song.artist}</p>
            {song.album && <p className="text-xs text-muted-foreground">{song.album}</p>}
          </>
        )}
        
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span>Duration: {formatDuration(song.duration)}</span>
          <span>Plays: {song.play_count || 0}</span>
          <span>Likes: {song.like_count || 0}</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {isEditing ? (
          <>
            <Button onClick={handleSave} variant="default" size="sm">
              <Save className="w-4 h-4" />
            </Button>
            <Button onClick={onCancelEdit} variant="outline" size="sm">
              <X className="w-4 h-4" />
            </Button>
          </>
        ) : (
          <>
            <Button onClick={onEdit} variant="outline" size="sm">
              <Edit className="w-4 h-4" />
            </Button>
            <Button onClick={onDelete} variant="destructive" size="sm">
              <Trash2 className="w-4 h-4" />
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;