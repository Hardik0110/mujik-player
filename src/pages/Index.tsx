import { useEffect, useState } from "react";
import Header from "@/components/Header";
import SongsList from "@/components/SongsList";
import SongDetails from "@/components/SongDetails";
import MusicPlayer from "@/components/MusicPlayer";
import SpotifyAuth from "@/components/SpotifyAuth";
import { Song } from "@/types/song";
import { searchTracks, setAccessToken } from "@/services/spotify";

interface IndexProps {
  isAuthenticated: boolean;
  onAuthChange: (authenticated: boolean) => void;
}

const Index = ({ isAuthenticated, onAuthChange }: IndexProps) => {
  const [search, setSearch] = useState("");
  const [songs, setSongs] = useState<Song[]>([]);
  const [activeSong, setActiveSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);  const [isLoading, setIsLoading] = useState(false);

  // Initialize Spotify token on component mount
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
          setAccessToken(token); // Ensure token is set before search
          const results = await searchTracks(search);
          setSongs(results);
        } catch (error) {
          console.error("Error searching tracks:", error);
        } finally {
          setIsLoading(false);
        }
      }, 300);

      return () => clearTimeout(delayDebounce);
    } else if (search === "") {
      setSongs([]);
    }
  }, [search, isAuthenticated]);

  const handleSongSelect = (song: Song) => {
    setActiveSong(song);
    setIsPlaying(true);
  };

  if (!isAuthenticated) {
    return <SpotifyAuth onAuthenticated={onAuthChange} />;
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-white to-accent/20">
      <Header search={search} setSearch={setSearch} />
      
      <main className="flex-1 container mx-auto px-4 md:px-6 py-6 min-h-0">
        <div className="h-full grid grid-cols-1 md:grid-cols-2 gap-6">
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
      
      <footer className="px-4 md:px-6 pb-4 pt-0">
        <div className="container mx-auto">
          <MusicPlayer
            song={activeSong}
            songs={songs}
            isPlaying={isPlaying}
            setIsPlaying={setIsPlaying}
            onSelectSong={setActiveSong}
          />
        </div>
      </footer>
    </div>
  );
};

export default Index;