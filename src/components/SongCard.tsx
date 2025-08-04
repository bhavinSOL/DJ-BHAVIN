import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Pause, Heart, Download, Share2, MessageCircle } from 'lucide-react';
import { useMusicPlayer } from '@/contexts/MusicPlayerContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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

interface SongCardProps {
  song: Song;
  onShowComments: (songId: string) => void;
}

const SongCard = ({ song, onShowComments }: SongCardProps) => {
  const { currentSong, isPlaying, playSong, pauseSong, resumeSong } = useMusicPlayer();
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(song.like_count || 0);
  const { toast } = useToast();

  const isCurrentSong = currentSong?.id === song.id;

  const handlePlayPause = () => {
    if (isCurrentSong) {
      if (isPlaying) {
        pauseSong();
      } else {
        resumeSong();
      }
    } else {
      playSong(song);
    }
  };

  const handleLike = async () => {
    try {
      const sessionId = 'anonymous-' + Date.now(); // Simple session ID for anonymous users
      
      if (isLiked) {
        await supabase
          .from('likes')
          .delete()
          .eq('song_id', song.id)
          .eq('session_id', sessionId);
        setLikeCount(prev => prev - 1);
        setIsLiked(false);
        toast({ title: "Removed from favorites" });
      } else {
        await supabase
          .from('likes')
          .insert({ song_id: song.id, session_id: sessionId });
        setLikeCount(prev => prev + 1);
        setIsLiked(true);
        toast({ title: "Added to favorites" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to update favorites", variant: "destructive" });
    }
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(song.file_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `${song.artist} - ${song.title}.mp3`;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the blob URL
      window.URL.revokeObjectURL(url);
      
      toast({ title: "Download started", description: `${song.title} by ${song.artist}` });
    } catch (error) {
      toast({ title: "Download failed", description: "Please try again", variant: "destructive" });
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${song.title} by ${song.artist}`,
          text: `Check out this awesome song: ${song.title}`,
          url: window.location.href
        });
      } catch (error) {
        // Fallback to clipboard
        await navigator.clipboard.writeText(`${song.title} by ${song.artist} - ${window.location.href}`);
        toast({ title: "Link copied to clipboard" });
      }
    } else {
      await navigator.clipboard.writeText(`${song.title} by ${song.artist} - ${window.location.href}`);
      toast({ title: "Link copied to clipboard" });
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="group hover:shadow-music transition-all duration-300 hover:-translate-y-1 bg-card border-border overflow-hidden">
      <CardContent className="p-0">
        {/* Cover Image */}
        <div className="relative overflow-hidden">
          <img
            src={song.cover_image_url || '/placeholder.svg'}
            alt={`${song.title} cover`}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <Button
              onClick={handlePlayPause}
              variant="ghost"
              size="icon"
              className="w-16 h-16 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground hover:scale-110 transition-all duration-200"
            >
              {isCurrentSong && isPlaying ? (
                <Pause className="w-8 h-8" />
              ) : (
                <Play className="w-8 h-8" />
              )}
            </Button>
          </div>
        </div>

        {/* Song Info */}
        <div className="p-4 space-y-3">
          <div>
            <h3 className="font-semibold text-lg truncate text-foreground">{song.title}</h3>
            <p className="text-muted-foreground truncate">{song.artist}</p>
            {song.album && <p className="text-sm text-muted-foreground truncate">{song.album}</p>}
          </div>

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{formatDuration(song.duration)}</span>
            <span>{song.play_count || 0} plays</span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-2 border-t border-border">
            <div className="flex items-center gap-2">
              <Button
                onClick={handleLike}
                variant="like"
                size="sm"
                className={isLiked ? 'bg-music-like text-foreground' : ''}
              >
                <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                {likeCount}
              </Button>

              <Button
                onClick={handleDownload}
                variant="download"
                size="sm"
              >
                <Download className="w-4 h-4" />
              </Button>

              <Button
                onClick={handleShare}
                variant="share"
                size="sm"
              >
                <Share2 className="w-4 h-4" />
              </Button>
            </div>

            <Button
              onClick={() => onShowComments(song.id)}
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground"
            >
              <MessageCircle className="w-4 h-4" />
              Comments
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SongCard;