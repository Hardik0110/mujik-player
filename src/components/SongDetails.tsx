
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Song } from "@/types/song";

interface SongDetailsProps {
  song: Song | null;
  isPlaying: boolean;
}

export const SongDetails = ({ song, isPlaying }: SongDetailsProps) => {
  if (!song) {
    return (
      <Card className="h-full border border-secondary/30 shadow-md">
        <CardHeader className="bg-secondary/20 pb-3">
          <CardTitle className="text-xl text-primary">Now Playing</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-10 text-center">
          <div className="w-32 h-32 rounded-full bg-accent mb-5 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#493D9E"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 18V5l12-2v13" />
              <circle cx="6" cy="18" r="3" />
              <circle cx="18" cy="16" r="3" />
            </svg>
          </div>
          <p className="text-gray-500">Select a song to start playing</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full border border-secondary/30 shadow-md">
      <CardHeader className="bg-secondary/20 pb-3">
        <CardTitle className="text-xl text-primary">Now Playing</CardTitle>
      </CardHeader>
      <CardContent className="p-6 flex flex-col items-center text-center">
        <div className="relative mb-6">
          <div className={`w-32 h-32 rounded-full bg-primary flex items-center justify-center ${isPlaying ? 'animate-spin-slow' : ''}`}>
            <div className="w-28 h-28 rounded-full bg-highlight flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center text-2xl font-bold text-primary">
                {song.title.charAt(0)}
              </div>
            </div>
          </div>
          <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center">
            <div className={`w-3 h-3 rounded-full ${isPlaying ? 'bg-green-500' : 'bg-gray-400'}`}></div>
          </div>
        </div>
        
        <h2 className="text-xl font-bold text-primary mt-4">{song.title}</h2>
        <p className="text-gray-600 mb-4">{song.artist}</p>
        
        <div className="w-full bg-accent p-4 rounded-lg mb-2">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Album</span>
            <span>{song.album}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Released</span>
            <span>{song.year}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>Duration</span>
            <span>{song.duration}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SongDetails;
