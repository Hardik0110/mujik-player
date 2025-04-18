
import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Song } from "@/types/song";

interface SongsListProps {
  songs: Song[];
  activeSong: Song | null;
  onSongSelect: (song: Song) => void;
  search: string;
}

export const SongsList = ({ songs, activeSong, onSongSelect, search }: SongsListProps) => {
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
    <Card className="h-full overflow-hidden border border-secondary/30 shadow-md">
      <CardHeader className="bg-secondary/20 pb-3">
        <CardTitle className="text-xl text-primary flex items-center">
          <span>Songs Library</span>
          <span className="ml-2 text-sm bg-primary text-white px-2 py-0.5 rounded-full">
            {filteredSongs.length}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 overflow-auto max-h-[calc(100vh-350px)]">
        {filteredSongs.length > 0 ? (
          <ul className="divide-y divide-accent">
            {filteredSongs.map((song) => (
              <li
                key={song.id}
                className={`song-item px-4 py-3 cursor-pointer transition-colors flex items-center ${
                  activeSong?.id === song.id ? "active-song" : ""
                }`}
                onClick={() => onSongSelect(song)}
              >
                <div className="w-10 h-10 rounded bg-accent flex-shrink-0 flex items-center justify-center mr-3">
                  {activeSong?.id === song.id ? (
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                  ) : (
                    <span className="text-sm text-primary">{song.id}</span>
                  )}
                </div>
                <div className="flex-grow min-w-0">
                  <h3 className="font-medium truncate">{song.title}</h3>
                  <p className="text-sm text-gray-600 truncate">{song.artist}</p>
                </div>
                <span className="text-xs text-gray-500 ml-3">{song.duration}</span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <Search size={40} className="text-gray-400 mb-2" />
            <p className="text-gray-500">No songs found matching "{search}"</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SongsList;
