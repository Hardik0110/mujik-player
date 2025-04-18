
import { useState, useEffect, useRef } from "react";
import { Play, Pause, SkipBack, SkipForward, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Song } from "@/types/song";
import { Slider } from "@/components/ui/slider";

interface MusicPlayerProps {
  song: Song | null;
  songs: Song[];
  isPlaying: boolean;
  setIsPlaying: (isPlaying: boolean) => void;
  onSelectSong: (song: Song) => void;
}

export const MusicPlayer = ({
  song,
  songs,
  isPlaying,
  setIsPlaying,
  onSelectSong,
}: MusicPlayerProps) => {
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(80);
  
  const progressInterval = useRef<number | null>(null);

  useEffect(() => {
    // Reset current time when a new song is selected
    if (song) {
      setCurrentTime(0);
      setDuration(100); // In a real app, this would be the actual song duration
      
      // Auto-play when a song is selected
      setIsPlaying(true);
    }
  }, [song, setIsPlaying]);

  useEffect(() => {
    // Simulate song progress
    if (isPlaying && song) {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
      
      progressInterval.current = window.setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= duration) {
            handleNext();
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
        progressInterval.current = null;
      }
    }
    
    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
        progressInterval.current = null;
      }
    };
  }, [isPlaying, duration, song]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handlePrevious = () => {
    if (!song || songs.length === 0) return;
    
    const currentIndex = songs.findIndex((s) => s.id === song.id);
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : songs.length - 1;
    onSelectSong(songs[prevIndex]);
  };

  const handleNext = () => {
    if (!song || songs.length === 0) return;
    
    const currentIndex = songs.findIndex((s) => s.id === song.id);
    const nextIndex = currentIndex < songs.length - 1 ? currentIndex + 1 : 0;
    onSelectSong(songs[nextIndex]);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-primary-gradient text-white p-4 rounded-lg shadow-lg">
      <div className="flex flex-col md:flex-row items-center gap-4">
        <div className="flex-shrink-0 flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20"
            onClick={handlePrevious}
            disabled={!song}
          >
            <SkipBack size={20} />
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            className="bg-white text-primary hover:bg-white/90 hover:text-primary rounded-full w-12 h-12 flex items-center justify-center"
            onClick={handlePlayPause}
            disabled={!song}
          >
            {isPlaying ? <Pause size={20} /> : <Play size={20} className="ml-0.5" />}
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20"
            onClick={handleNext}
            disabled={!song}
          >
            <SkipForward size={20} />
          </Button>
        </div>
        
        <div className="flex-grow w-full">
          <div className="flex justify-between text-xs mb-1">
            <span>{formatTime(currentTime)}</span>
            <span>{song ? song.duration : "0:00"}</span>
          </div>
          
          <Slider
            value={[currentTime]}
            max={duration}
            step={1}
            disabled={!song}
            onValueChange={(value) => setCurrentTime(value[0])}
            className="cursor-pointer"
          />
          
          <div className="flex items-center mt-1">
            {song ? (
              <div className="flex-grow">
                <p className="text-sm font-medium truncate">{song.title}</p>
                <p className="text-xs text-secondary truncate">{song.artist}</p>
              </div>
            ) : (
              <div className="flex-grow">
                <p className="text-sm font-medium">Select a song</p>
                <p className="text-xs text-secondary">from the library</p>
              </div>
            )}
            
            <div className="hidden md:flex items-center ml-4 space-x-2 min-w-[120px]">
              <Volume2 size={16} className="text-secondary" />
              <Slider
                value={[volume]}
                max={100}
                step={1}
                onValueChange={(value) => setVolume(value[0])}
                className="w-20"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MusicPlayer;
