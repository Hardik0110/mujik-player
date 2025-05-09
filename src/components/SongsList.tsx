// src/components/SongsList.tsx
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Song } from "@/types/song";
import { formatTime } from "@/lib/utils";

interface Props {
  songs: Song[];
  activeSong: Song | null;
  onSongSelect: (song: Song) => void;
  search: string;
  isLoading?: boolean;
}

const SongsList = ({ songs, activeSong, onSongSelect, search, isLoading = false }: Props) => {
  const [filteredSongs, setFilteredSongs] = useState<Song[]>(songs);

  useEffect(() => {
    if (search.trim() === "") {
      setFilteredSongs(songs);
    } else {
      const filtered = songs.filter(
        (song) =>
          song.title.toLowerCase().includes(search.toLowerCase()) ||
          song.artist.toLowerCase().includes(search.toLowerCase())
      );
      setFilteredSongs(filtered);
    }
  }, [search, songs]);

  return (
    <div className="bg-white/5 backdrop-blur-lg border rounded-lg p-4 h-full overflow-y-hidden">
      <h2 className="text-xl font-semibold mb-4">Songs</h2>
      
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <div className="space-y-2 max-h-[300px] overflow-y-auto">
          {filteredSongs.length === 0 && (
            <p className="text-muted-foreground text-center py-4">
              {search ? "No songs found" : "Search for songs to play"}
            </p>
          )}
          {filteredSongs.map((song) => (
            <button
              key={song.id}
              onClick={() => onSongSelect(song)}
              className={`w-full flex items-center gap-3 p-2 rounded-md hover:bg-white/10 transition-colors ${
                activeSong?.id === song.id ? "bg-white/10" : ""
              }`}
            >
              <img
                src={song.cover || "/placeholder.svg"}
                alt={song.title}
                className="w-12 h-12 rounded object-cover"
              />
              <div className="flex-1 text-left min-w-0">
                <h3 className="font-medium truncate">{song.title}</h3>
                <p className="text-sm text-muted-foreground truncate">
                  {song.artist}
                </p>
              </div>
              <span className="text-sm text-muted-foreground">
                {formatTime(song.duration)}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SongsList;