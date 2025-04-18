
import { useState } from "react";
import Header from "@/components/Header";
import SongsList from "@/components/SongsList";
import SongDetails from "@/components/SongDetails";
import MusicPlayer from "@/components/MusicPlayer";
import { songs } from "@/data/songs";
import { Song } from "@/types/song";

const Index = () => {
  const [search, setSearch] = useState("");
  const [activeSong, setActiveSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleSongSelect = (song: Song) => {
    setActiveSong(song);
    setIsPlaying(true);
  };

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
