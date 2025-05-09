import { useEffect, useState } from "react";
import Header from "@/components/Header";
import SongsList from "@/components/SongsList";
import SongDetails from "@/components/SongDetails";
import MusicPlayer from "@/components/MusicPlayer";
import SpotifyAuth from "@/components/SpotifyAuth";
import { Song } from "@/types/song";
import { searchTracks, setAccessToken } from "@/services/spotify";
import { useToast } from "@/components/ui/use-toast";

interface IndexProps {
  isAuthenticated: boolean;
  onAuthChange: (authenticated: boolean) => void;
}

const Index = ({ isAuthenticated, onAuthChange }: IndexProps) => {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [songs, setSongs] = useState<Song[]>([]);
  const [activeSong, setActiveSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('spotify_access_token');
    if (token) {
      setAccessToken(token);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && search) {
      setIsLoading(true);
      const delayDebounce = setTimeout(async () => {
        try {
          const token = localStorage.getItem('spotify_access_token');
          if (!token) {
            throw new Error('No access token found');
          }
          setAccessToken(token);
          const results = await searchTracks(search);
          setSongs(results);
        } catch (error) {
          console.error("Error searching tracks:", error);
          toast({
            variant: "destructive",
            title: "Search Error",
            description: "Failed to search for tracks. Please try again.",
          });
        } finally {
          setIsLoading(false);
        }
      }, 300);

      return () => clearTimeout(delayDebounce);
    } else if (search === "") {
      setSongs([]);
    }
  }, [search, isAuthenticated, toast]);

  const handleSongSelect = (song: Song) => {
    setActiveSong(song);
    setIsPlaying(true);
  };

  if (!isAuthenticated) {
    return <SpotifyAuth onAuthenticated={onAuthChange} />;
  }

  return (
    <div className="h-screen flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-[#1db954]/30 via-fuchsia-500/20 to-sky-500/30 animate-[gradientShift_15s_ease_infinite] bg-[length:400%_400%]" />
      
      <Header search={search} setSearch={setSearch} />
      
      <main className="flex-1 container mx-auto px-2 py-2 overflow-hidden flex flex-col">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 flex-1 overflow-hidden">
          <SongsList
            songs={songs}
            activeSong={activeSong}
            onSongSelect={handleSongSelect}
            search={search}
            isLoading={isLoading}
          />
          <SongDetails song={activeSong} isPlaying={isPlaying} />
        </div>
      </main>

      <div className="px-2 pb-2">
        <MusicPlayer
          song={activeSong}
          songs={songs}
          isPlaying={isPlaying}
          setIsPlaying={setIsPlaying}
          onSelectSong={setActiveSong}
        />
      </div>
    </div>
  );
};

export default Index;
