import { useEffect, useRef, useState } from "react";
import { Song } from "@/types/song";
import { WebPlaybackPlayer, WebPlaybackState } from "@/types/spotify";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/components/ui/use-toast";
import { formatTime } from "@/lib/utils";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume1,
  Volume2,
  VolumeX,
} from "lucide-react";
import { 
  pausePlayback,
  playTrack,
  resumePlayback,
  seekToPosition,
  setVolume as setSpotifyVolume
} from "@/services/spotify";

interface Props {
  song: Song | null;
  songs: Song[];
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  onSelectSong: (song: Song) => void;
}

const MusicPlayer = ({
  song,
  songs,
  isPlaying,
  setIsPlaying,
  onSelectSong,
}: Props) => {
  const { toast } = useToast();
  const [volume, setVolume] = useState(0.5);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const playerRef = useRef<WebPlaybackPlayer | null>(null);
  const progressInterval = useRef<number | null>(null);
  const volumeChangeTimeout = useRef<NodeJS.Timeout | null>(null);

  // Initialize Spotify Web Playback SDK
  useEffect(() => {
    const initializePlayer = async () => {
      const token = window.localStorage.getItem('spotify_access_token');
      if (!token) return;

      // Prevent multiple initializations
      if (playerRef.current) {
        playerRef.current.disconnect();
      }

      const player = new window.Spotify.Player({
        name: "Mujik Player",
        getOAuthToken: (cb: (token: string) => void) => cb(token),
        volume: volume,
      });

      // Intercept console errors to handle the PlayLoad 404 gracefully
      const originalError = console.error;
      console.error = (...args) => {
        const errorMessage = args.join(' ');
        if (errorMessage.includes('PlayLoad event failed with status 404') ||
            errorMessage.includes('/event/item_before_load 404')) {
          // Silently ignore this specific error as it's expected behavior
          return;
        }
        originalError.apply(console, args);
      };

      player.addListener('authentication_error', ({ message }: { message: string }) => {
        console.error('Failed to authenticate:', message);
        toast({
          variant: "destructive",
          title: "Authentication Error",
          description: "Please try logging in again.",
        });
        window.localStorage.removeItem('spotify_access_token');
        window.location.href = '/';
      });

      player.addListener('account_error', ({ message }: { message: string }) => {
        console.error('Failed to validate Spotify account:', message);
        toast({
          variant: "destructive",
          title: "Premium Required",
          description: "Spotify Premium is required for playback.",
        });
      });

      player.addListener("ready", ({ device_id }: { device_id: string }) => {
        console.log("Ready with Device ID", device_id);
        setDeviceId(device_id);
        setIsReady(true);
        playerRef.current = player;
      });

      player.addListener("not_ready", ({ device_id }: { device_id: string }) => {
        console.log("Device ID has gone offline", device_id);
        setIsReady(false);
      });

      player.addListener("player_state_changed", (state: WebPlaybackState | null) => {
        if (state) {
          setProgress(state.position);
          setDuration(state.duration);
          setIsPlaying(!state.paused);
          
          // Update song if changed via Spotify controls  
          if (state.track_window?.current_track) {
            const currentTrackId = state.track_window.current_track.id;
            if (song?.id !== currentTrackId) {
              const newSong = songs.find(s => s.id === currentTrackId);
              if (newSong) {
                onSelectSong(newSong);
              }
            }
          }
        }
      });

      try {
        await player.connect();
        console.log("Player connected!");
      } catch (error) {
        console.error("Failed to connect player:", error);
        toast({
          variant: "destructive",
          title: "Playback Error",
          description: "Failed to initialize Spotify player. Please refresh the page.",
        });
      }
    };

    if (window.Spotify) {
      initializePlayer();
    } else {
      const script = document.createElement("script");
      script.src = "https://sdk.scdn.co/spotify-player.js";
      script.async = true;
      document.body.appendChild(script);

      window.onSpotifyWebPlaybackSDKReady = () => {
        initializePlayer();
      };
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.disconnect();
      }
      if (progressInterval.current) {
        window.clearInterval(progressInterval.current);
      }
      if (volumeChangeTimeout.current) {
        clearTimeout(volumeChangeTimeout.current);
      }
    };
  }, [toast]);

  // Set up progress interval for smoother progress updates
  useEffect(() => {
    if (isPlaying) {
      if (progressInterval.current) {
        window.clearInterval(progressInterval.current);
      }
      
      progressInterval.current = window.setInterval(() => {
        setProgress(prev => {
          // Don't exceed duration
          if (prev >= duration) {
            return duration;
          }
          return prev + 1000;
        });
      }, 1000);
    } else if (progressInterval.current) {
      window.clearInterval(progressInterval.current);
    }

    return () => {
      if (progressInterval.current) {
        window.clearInterval(progressInterval.current);
      }
    };
  }, [isPlaying, duration]);

  // Handle song changes and playback
  useEffect(() => {
    const startPlayback = async () => {
      if (song && deviceId && isReady) {
        try {
          await playTrack(song.uri, deviceId);
          setIsPlaying(true);
        } catch (error) {
          console.error('Playback error:', error);
          toast({
            variant: "destructive",
            title: "Playback Error",
            description: "Failed to play track. Please try again.",
          });
        }
      }
    };

    if (song && deviceId && isReady) {
      startPlayback();
    }
  }, [song, deviceId, isReady, setIsPlaying, toast]);

  // Update player volume when volume state changes
  useEffect(() => {
    if (playerRef.current && isReady) {
      try {
        playerRef.current.setVolume(volume);
      } catch (error) {
        console.error('Volume setting error:', error);
      }
    }
  }, [volume, isReady]);

  const togglePlayPause = async () => {
    try {
      if (isPlaying) {
        await pausePlayback();
        setIsPlaying(false);
      } else {
        await resumePlayback();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Toggle play/pause error:', error);
      toast({
        variant: "destructive",
        title: "Playback Error",
        description: "Failed to toggle playback. Please try again.",
      });
    }
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    
    // Debounce volume API calls to prevent playback issues
    if (volumeChangeTimeout.current) {
      clearTimeout(volumeChangeTimeout.current);
    }
    
    volumeChangeTimeout.current = setTimeout(() => {
      setSpotifyVolume(newVolume).catch(error => {
        console.error('Set volume error:', error);
      });
    }, 200);
  };

  const handleProgressChange = (value: number[]) => {
    const newPosition = value[0];
    if (duration) {
      const positionMs = Math.floor(newPosition * duration);
      setProgress(positionMs);
      
      seekToPosition(positionMs).catch(error => {
        console.error('Seek position error:', error);
        toast({
          variant: "destructive",
          title: "Playback Error",
          description: "Failed to seek to position. Please try again.",
        });
      });
    }
  };

  const playPreviousSong = () => {
    if (song && songs.length > 0) {
      const currentIndex = songs.findIndex((s) => s.id === song.id);
      const previousSong = songs[currentIndex - 1] || songs[songs.length - 1];
      onSelectSong(previousSong);
    }
  };

  const playNextSong = () => {
    if (song && songs.length > 0) {
      const currentIndex = songs.findIndex((s) => s.id === song.id);
      const nextSong = songs[currentIndex + 1] || songs[0];
      onSelectSong(nextSong);
    }
  };

  const getVolumeIcon = () => {
    if (volume === 0) return <VolumeX size={20} />;
    if (volume < 0.5) return <Volume1 size={20} />;
    return <Volume2 size={20} />;
  };

  return (
    <div className="bg-white/10 backdrop-blur-lg border rounded-lg p-3 w-full">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {song && (
            <img
              src={song.cover || "/placeholder.svg"}
              alt={song.title}
              className="w-12 h-12 rounded-md object-cover"
            />
          )}
          <div className="min-w-0">
            <h3 className="text-base font-semibold truncate">
              {song?.title || "No song selected"}
            </h3>
            <p className="text-xs text-muted-foreground truncate">
              {song?.artist || "---"}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center gap-1 flex-1">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={playPreviousSong}
              disabled={!song}
              className="h-8 w-8 p-0"
            >
              <SkipBack size={16} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={togglePlayPause}
              disabled={!song}
              className="h-8 w-8 p-0"
            >
              {isPlaying ? <Pause size={16} /> : <Play size={16} />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={playNextSong}
              disabled={!song}
              className="h-8 w-8 p-0"
            >
              <SkipForward size={16} />
            </Button>
          </div>
          <div className="flex items-center gap-1 w-full max-w-md">
            <span className="text-xs tabular-nums w-10">
              {formatTime(progress)}
            </span>
            <Slider
              value={[duration > 0 ? progress / duration : 0]}
              onValueChange={handleProgressChange}
              max={1}
              step={0.001}
              className="flex-1"
            />
            <span className="text-xs tabular-nums w-10">
              {formatTime(duration)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 flex-1 justify-end">
          {getVolumeIcon()}
          <Slider
            value={[volume]}
            onValueChange={handleVolumeChange}
            max={1}
            step={0.01}
            className="w-20"
          />
        </div>
      </div>
    </div>
  );
};

export default MusicPlayer;