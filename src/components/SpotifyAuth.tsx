import { useState } from 'react';
import { generateSpotifyAuthUrl } from '@/services/spotify';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface SpotifyAuthProps {
  onAuthenticated: (authenticated: boolean) => void;
}

const SpotifyAuth = ({ onAuthenticated }: SpotifyAuthProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSpotifyConnect = async () => {
    try {
      setIsLoading(true);
      const url = await generateSpotifyAuthUrl();
      window.location.href = url;
    } catch (error) {
      console.error('Failed to generate auth URL:', error);
      toast({
        variant: "destructive",
        title: "Connection Failed",
        description: "Unable to connect to Spotify. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-accent/20">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold">Welcome to Mujik Player</h1>
        <p className="text-lg text-muted-foreground">
          Connect with Spotify to start listening to your favorite music
        </p>
        <Button
          size="lg"
          onClick={handleSpotifyConnect}
          disabled={isLoading}
          className="bg-green-500 hover:bg-green-600 text-white"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Connecting...
            </>
          ) : (
            'Connect with Spotify'
          )}
        </Button>
      </div>
    </div>
  );
};

export default SpotifyAuth;