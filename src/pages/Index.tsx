import { useEffect, useState } from "react";
import Header from "@/components/Header";
import SongsList from "@/components/SongsList";
import SongDetails from "@/components/SongDetails";
import MusicPlayer from "@/components/MusicPlayer";
import { Song } from "@/types/song";
import { generateSpotifyAuthUrl, searchTracks, setAccessToken } from "@/services/spotify";

const Index = () => {
  const [search, setSearch] = useState("");
  const [songs, setSongs] = useState<Song[]>([]);
  const [activeSong, setActiveSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check for authentication callback
    const hash = window.location.hash;
    if (hash) {
      const token = hash.substring(1).split("&")[0].split("=")[1];
      if (token) {
        setAccessToken(token);
        setIsAuthenticated(true);
        window.location.hash = "";
      }
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && search) {
      const delayDebounce = setTimeout(async () => {
        const results = await searchTracks(search);
        setSongs(results);
      }, 300);

      return () => clearTimeout(delayDebounce);
    }
  }, [search, isAuthenticated]);

  const handleSongSelect = (song: Song) => {
    setActiveSong(song);
    setIsPlaying(true);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-accent/20">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-6">Welcome to Mujik Player</h1>
          <a
            href={generateSpotifyAuthUrl()}
            className="bg-green-500 text-white px-6 py-3 rounded-full hover:bg-green-600 transition-colors"
          >
            Connect with Spotify
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-white to-accent/20">
      <Header search={search} setSearch={setSearch} />
      
      <main className="flex-grow container mx-auto px-4 md:px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <SongsList
            songs={songs}
            activeSong={activeSong}
            onSongSelect={handleSongSelect}
            search={search}
          />
          
          <SongDetails song={activeSong} isPlaying={isPlaying} />
        </div>
      </main>
      
      <footer className="sticky bottom-0 z-10 px-4 md:px-6 pb-4 pt-0">
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
