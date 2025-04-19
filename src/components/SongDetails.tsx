import { Song } from "@/types/song";
import { formatTime } from "@/lib/utils";

interface Props {
  song: Song | null;
  isPlaying: boolean;
}

const SongDetails = ({ song, isPlaying }: Props) => {
  if (!song) {
    return (
      <div className="bg-white/5 backdrop-blur-lg border rounded-lg p-4 flex items-center justify-center h-[300px]">
        <p className="text-muted-foreground">Select a song to view details</p>
      </div>
    );
  }

  return (
    <div className="bg-white/5 backdrop-blur-lg border rounded-lg p-4">
      <div className="aspect-square relative rounded-md overflow-hidden mb-4">
        <img
          src={song.cover || "/placeholder.svg"}
          alt={song.title}
          className="w-full h-full object-cover"
        />
        <div className={`absolute inset-0 bg-black/20 ${
          isPlaying ? "animate-pulse" : ""
        }`} />
      </div>
      
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold">{song.title}</h2>
        <p className="text-lg text-muted-foreground">{song.artist}</p>
        <p className="text-sm text-muted-foreground">{song.album}</p>
        <p className="text-sm text-muted-foreground">
          Duration: {formatTime(song.duration)}
        </p>
      </div>
    </div>
  );
};

export default SongDetails;
