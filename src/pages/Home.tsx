import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Music, Search, Settings, Phone, Folder, ArrowLeft } from 'lucide-react';
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
  category_id?: string;
}

interface Category {
  id: string;
  name: string;
  description?: string;
  image_url?: string;
  created_at: string;
}

const Home = () => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredSongs, setFilteredSongs] = useState<Song[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSongForComments, setSelectedSongForComments] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { setPlaylist } = useMusicPlayer();
  const { toast } = useToast();

  useEffect(() => {
    fetchSongs();
    fetchCategories();
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

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const getSongsInCategory = (categoryId: string) => {
    return songs.filter(song => song.category_id === categoryId);
  };

  const getUncategorizedSongs = () => {
    return songs.filter(song => !song.category_id);
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
                DJ BHAVIN
              </h1>
            </div>

            <div className="flex items-center gap-4">
              <Link to="/contact">
                <Button variant="outline" size="sm">
                  <Phone className="w-4 h-4" />
                  Contact
                </Button>
              </Link>
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
        ) : selectedCategory ? (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Button 
                onClick={() => setSelectedCategory(null)}
                variant="outline"
                size="sm"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </Button>
              <div className="flex items-center gap-3">
                <img
                  src={selectedCategory.image_url || '/placeholder.svg'}
                  alt={selectedCategory.name}
                  className="w-12 h-12 rounded-lg object-cover"
                />
                <div>
                  <h2 className="text-2xl font-bold">{selectedCategory.name}</h2>
                  {selectedCategory.description && (
                    <p className="text-muted-foreground">{selectedCategory.description}</p>
                  )}
                  <Badge variant="secondary" className="mt-1">
                    {getSongsInCategory(selectedCategory.id).length} songs
                  </Badge>
                </div>
              </div>
            </div>

            {getSongsInCategory(selectedCategory.id).length === 0 ? (
              <div className="text-center py-12">
                <Music className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h2 className="text-xl font-semibold mb-2">No songs in this category</h2>
                <p className="text-muted-foreground">
                  This category doesn't have any songs yet.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {getSongsInCategory(selectedCategory.id).map((song) => (
                  <SongCard
                    key={song.id}
                    song={song}
                    onShowComments={handleShowComments}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-12">
            {/* Categories Section */}
            {categories.length > 0 && (
              <section>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                    <Folder className="w-6 h-6" />
                    Browse by Category
                  </h2>
                  <p className="text-muted-foreground">
                    Explore music organized by categories
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {categories.map((category) => (
                    <Card
                      key={category.id}
                      className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:border-primary/50 bg-muted"
                      onClick={() => setSelectedCategory(category)}
                    >
                      <CardContent className="p-6">
                        <div className="flex flex-col items-center text-center space-y-4">
                          <img
                            src={category.image_url || '/placeholder.svg'}
                            alt={category.name}
                            className="w-24 h-24 rounded-lg object-cover"
                          />
                          <div>
                            <h3 className="font-semibold text-lg">{category.name}</h3>
                            {category.description && (
                              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                {category.description}
                              </p>
                            )}
                            <Badge variant="secondary" className="mt-3">
                              {getSongsInCategory(category.id).length} songs
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            )}

            {/* All Songs Section */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Music className="w-6 h-6" />
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

              {filteredSongs.length === 0 ? (
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
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                  {filteredSongs.map((song) => (
                    <SongCard
                      key={song.id}
                      song={song}
                      onShowComments={handleShowComments}
                    />
                  ))}
                </div>
              )}
            </section>
          </div>
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


