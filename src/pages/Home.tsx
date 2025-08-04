import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Music, Search, Heart, Settings, Phone } from 'lucide-react';
import SongCard from '@/components/SongCard';
import MusicPlayer from '@/components/MusicPlayer';
import CommentsSection from '@/components/CommentsSection';
import { useMusicPlayer } from '@/contexts/MusicPlayerContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';

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
}

const Home = () => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [filteredSongs, setFilteredSongs] = useState<Song[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSongForComments, setSelectedSongForComments] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { setPlaylist } = useMusicPlayer();
  const { toast } = useToast();

  useEffect(() => {
    fetchSongs();
  }, []);

  useEffect(() => {
    // Filter songs based on search query
    if (searchQuery.trim()) {
      const filtered = songs.filter(song =>
        song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        song.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
        song.album?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredSongs(filtered);
    } else {
      setFilteredSongs(songs);
    }
  }, [songs, searchQuery]);

  const fetchSongs = async () => {
    try {
      const { data, error } = await supabase
        .from('songs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setSongs(data || []);
      setPlaylist(data || []);
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

  const handleShowComments = (songId: string) => {
    setSelectedSongForComments(songId);
  };

  const handleCloseComments = () => {
    setSelectedSongForComments(null);
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-music-gradient p-2 rounded-lg">
                <Music className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-music-gradient bg-clip-text text-transparent">
                DJ Bhavin
              </h1>
            </div>

            <div className="flex items-center gap-4">
              <Link to="/contact">
                <Button variant="outline" size="sm">
                  <Phone className="w-4 h-4" />
                  Contact
                </Button>
              </Link>
              {/* <Link to="/admin">
                <Button variant="outline" size="sm">
                  <Settings className="w-4 h-4" />
                  Admin
                </Button>
              </Link> */}
            </div>
          </div>

          {/* Search Bar */}
          <div className="mt-4 max-w-md mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search songs, artists, or albums..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-muted border-border"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading your music...</p>
          </div>
        ) : filteredSongs.length === 0 ? (
          <div className="text-center py-12">
            {searchQuery ? (
              <>
                <Search className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h2 className="text-xl font-semibold mb-2">No songs found</h2>
                <p className="text-muted-foreground">
                  Try searching with different keywords or browse all songs.
                </p>
                <Button
                  onClick={() => setSearchQuery('')}
                  variant="outline"
                  className="mt-4"
                >
                  Clear Search
                </Button>
              </>
            ) : (
              <>
                <Music className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h2 className="text-xl font-semibold mb-2">No songs available</h2>
                <p className="text-muted-foreground">
                  Songs will appear here once they are uploaded by an admin.
                </p>
              </>
            )}
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">
                {searchQuery ? `Search Results (${filteredSongs.length})` : `All Songs (${songs.length})`}
              </h2>
              {searchQuery && (
                <Button
                  onClick={() => setSearchQuery('')}
                  variant="outline"
                  size="sm"
                >
                  Clear Search
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {filteredSongs.map((song) => (
                <SongCard
                  key={song.id}
                  song={song}
                  onShowComments={handleShowComments}
                />
              ))}
            </div>
          </>
        )}
      </main>

      {/* Music Player */}
      <MusicPlayer />

      {/* Comments Modal */}
      {selectedSongForComments && (
        <CommentsSection
          songId={selectedSongForComments}
          onClose={handleCloseComments}
        />
      )}
    </div>
  );
};

export default Home;