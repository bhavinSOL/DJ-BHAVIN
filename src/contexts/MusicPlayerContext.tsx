import React, { createContext, useContext, useState, useRef, useEffect } from 'react';

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

interface MusicPlayerContextType {
  currentSong: Song | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  playlist: Song[];
  playlistIndex: number;
  playSong: (song: Song) => void;
  pauseSong: () => void;
  resumeSong: () => void;
  nextSong: () => void;
  prevSong: () => void;
  seekTo: (time: number) => void;
  setVolume: (volume: number) => void;
  setPlaylist: (songs: Song[]) => void;
}

const MusicPlayerContext = createContext<MusicPlayerContextType | undefined>(undefined);

export const useMusicPlayer = () => {
  const context = useContext(MusicPlayerContext);
  if (!context) {
    throw new Error('useMusicPlayer must be used within a MusicPlayerProvider');
  }
  return context;
};

export const MusicPlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [playlist, setPlaylist] = useState<Song[]>([]);
  const [playlistIndex, setPlaylistIndex] = useState(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.addEventListener('timeupdate', () => {
        setCurrentTime(audioRef.current?.currentTime || 0);
      });
      audioRef.current.addEventListener('loadedmetadata', () => {
        setDuration(audioRef.current?.duration || 0);
      });
      audioRef.current.addEventListener('ended', nextSong);
    }
  }, []);

  const playSong = (song: Song) => {
    if (audioRef.current) {
      audioRef.current.src = song.file_url;
      audioRef.current.play();
      setCurrentSong(song);
      setIsPlaying(true);
      
      // Find song in playlist and update index
      const index = playlist.findIndex(s => s.id === song.id);
      if (index !== -1) {
        setPlaylistIndex(index);
      }
    }
  };

  const pauseSong = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const resumeSong = () => {
    if (audioRef.current) {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const nextSong = () => {
    if (playlist.length > 0) {
      const nextIndex = (playlistIndex + 1) % playlist.length;
      playSong(playlist[nextIndex]);
    }
  };

  const prevSong = () => {
    if (playlist.length > 0) {
      const prevIndex = playlistIndex === 0 ? playlist.length - 1 : playlistIndex - 1;
      playSong(playlist[prevIndex]);
    }
  };

  const seekTo = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const updateVolume = (newVolume: number) => {
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
      setVolume(newVolume);
    }
  };

  return (
    <MusicPlayerContext.Provider
      value={{
        currentSong,
        isPlaying,
        currentTime,
        duration,
        volume,
        playlist,
        playlistIndex,
        playSong,
        pauseSong,
        resumeSong,
        nextSong,
        prevSong,
        seekTo,
        setVolume: updateVolume,
        setPlaylist,
      }}
    >
      {children}
    </MusicPlayerContext.Provider>
  );
};