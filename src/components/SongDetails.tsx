import { Song } from "@/types/song";

interface Props {
  song: Song | null;
  isPlaying: boolean;
}

const SongDetails = ({ song, isPlaying }: Props) => {
  if (!song) {
    return (
      <div className="bg-white/5 backdrop-blur-lg rounded-full flex items-center justify-center">
        <p className="text-muted-foreground">Select a song to view details</p>
      </div>
    );
  }

  return (
    <div className="bg-white/5 backdrop-blur-lg  h-full flex flex-col">
      <div className="relative rounded-full overflow-hidden mb-3 flex-1">
        <img
          src={song.cover || "/placeholder.svg"}
          alt={song.title}
          className={`w-full h-full object-cover rounded-full ${
            isPlaying ? "animate-[rotate_10s_linear_infinite]" : ""
          }`}
        />
        <div
          className={`absolute inset-0 bg-black/40 ${
            isPlaying ? "animate-pulse" : ""
          }`}
        />
      </div>
    </div>
  );
};

export default SongDetails;