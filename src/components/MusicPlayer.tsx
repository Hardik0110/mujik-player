// src/components/MusicPlayer.tsx
import { useEffect, useRef, useState } from "react";
import { Song } from "@/types/song";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
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

declare global {
  interface Window {
    Spotify: any;
    onSpotifyWebPlaybackSDKReady: () => void;
    player: any;
  }
}

const MusicPlayer = ({
  song,
  songs,
  isPlaying,
  setIsPlaying,
  onSelectSong,
}: Props) => {
  const [volume, setVolume] = useState(0.5);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const playerRef = useRef<any>(null);
  const progressInterval = useRef<number | null>(null);

  useEffect(() => {
    // Initialize Spotify Web Playback SDK
    const script = document.createElement("script");
    script.src = "https://sdk.scdn.co/spotify-player.js";
    script.async = true;
    document.body.appendChild(script);

    window.onSpotifyWebPlaybackSDKReady = () => {
      const token = window.localStorage.getItem('spotify_access_token');
      
      if (token) {
        const player = new window.Spotify.Player({
          name: "Mujik Player",
          getOAuthToken: (cb: (token: string) => void) => cb(token),
          volume: volume,
        });

        player.addListener("ready", ({ device_id }: { device_id: string }) => {
          console.log("Ready with Device ID", device_id);
          setDeviceId(device_id);
          playerRef.current = player;
        });

        player.addListener("player_state_changed", (state: any) => {
          if (state) {
            setProgress(state.position);
            setDuration(state.duration);
            setIsPlaying(!state.paused);
            
            // Update song if changed via Spotify controls
            if (state.track_window.current_track) {
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

        player.addListener("not_ready", ({ device_id }: { device_id: string }) => {
          console.log("Device ID has gone offline", device_id);
        });

        player.connect().then((success: boolean) => {
          if (success) {
            console.log("The Web Playback SDK successfully connected to Spotify!");
          }
        });

        window.player = player;
      }
    };

    return () => {
      if (playerRef.current) {
        playerRef.current.disconnect();
      }
      if (progressInterval.current) {
        window.clearInterval(progressInterval.current);
      }
      document.body.removeChild(script);
    };
  }, []);

  // Set up progress interval for smoother progress updates
  useEffect(() => {
    if (isPlaying) {
      progressInterval.current = window.setInterval(() => {
        setProgress(prev => Math.min(prev + 1000, duration));
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

  // Handle playing a song
  useEffect(() => {
    if (song && deviceId) {
      playTrack(song.uri, deviceId);
      setIsPlaying(true);
    }
  }, [song, deviceId]);

  const togglePlayPause = () => {
    if (isPlaying) {
      pausePlayback();
      setIsPlaying(false);
    } else {
      resumePlayback();
      setIsPlaying(true);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    setSpotifyVolume(newVolume);
    if (playerRef.current) {
      playerRef.current.setVolume(newVolume);
    }
  };

  const handleProgressChange = (value: number[]) => {
    const newPosition = value[0];
    if (duration) {
      const positionMs = Math.floor(newPosition * duration);
      setProgress(positionMs);
      seekToPosition(positionMs);
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
    <div className="bg-white/10 backdrop-blur-lg border rounded-lg p-4 w-full">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1">
          {song && (
            <img
              src={song.cover || "/placeholder.svg"}
              alt={song.title}
              className="w-16 h-16 rounded-md object-cover"
            />
          )}
          <div className="min-w-0">
            <h3 className="text-lg font-semibold truncate">
              {song?.title || "No song selected"}
            </h3>
            <p className="text-sm text-muted-foreground truncate">
              {song?.artist || "---"}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center gap-2 flex-1">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={playPreviousSong}
              disabled={!song}
            >
              <SkipBack size={20} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={togglePlayPause}
              disabled={!song}
            >
              {isPlaying ? <Pause size={20} /> : <Play size={20} />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={playNextSong}
              disabled={!song}
            >
              <SkipForward size={20} />
            </Button>
          </div>
          <div className="flex items-center gap-2 w-full max-w-md">
            <span className="text-sm tabular-nums">
              {formatTime(progress)}
            </span>
            <Slider
              value={[progress / (duration || 1)]}
              onValueChange={handleProgressChange}
              max={1}
              step={0.001}
              className="flex-1"
            />
            <span className="text-sm tabular-nums">
              {formatTime(duration)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-1 justify-end">
          {getVolumeIcon()}
          <Slider
            value={[volume]}
            onValueChange={handleVolumeChange}
            max={1}
            step={0.01}
            className="w-24"
          />
        </div>
      </div>
    </div>
  );
};

export default MusicPlayer;