// src/pages/Index.tsx
import { useEffect, useState } from "react";
import Header from "@/components/Header";
import SongsList from "@/components/SongsList";
import SongDetails from "@/components/SongDetails";
import MusicPlayer from "@/components/MusicPlayer";
import SpotifyAuth from "@/components/SpotifyAuth";
import { Song } from "@/types/song";
import { searchTracks } from "@/services/spotify";

const Index = () => {
  const [search, setSearch] = useState("");
  const [songs, setSongs] = useState<Song[]>([]);
  const [activeSong, setActiveSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated && search) {
      setIsLoading(true);
      const delayDebounce = setTimeout(async () => {
        try {
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
    return <SpotifyAuth onAuthenticated={setIsAuthenticated} />;
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
            isLoading={isLoading}
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