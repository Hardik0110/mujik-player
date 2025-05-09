import { useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { setAccessToken, storeTokens } from '@/services/spotify';

interface CallbackProps {
  onAuthenticated: () => void;
}

const CLIENT_ID = 'f29485f82aba428f9f058c89fa168371';
const REDIRECT_URI = 'https://192.168.1.16:5174/callback';

const Callback = ({ onAuthenticated }: CallbackProps) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  const handleTokenExchange = useCallback(async (code: string, verifier: string) => {
    try {
      const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: CLIENT_ID,
          grant_type: 'authorization_code',
          code: code,
          redirect_uri: REDIRECT_URI,
          code_verifier: verifier,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error_description || 'Failed to get access token');
      }

      const data = await response.json();
      setAccessToken(data.access_token);
      
      // Store tokens and expiration
      storeTokens(data);

      onAuthenticated();
      toast({
        title: "Connected to Spotify",
        description: "You can now play music from your Spotify account.",
      });
      
      // Navigate to home page
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Authentication error:', error);
      toast({
        variant: "destructive",
        title: "Authentication Failed",
        description: error instanceof Error ? error.message : "Failed to connect to Spotify",
      });
      navigate('/', { replace: true });
    }
  }, [navigate, onAuthenticated, toast]);

  useEffect(() => {
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      toast({
        variant: "destructive",
        title: "Authentication Failed",
        description: error === 'access_denied' 
          ? "You need to accept the permissions to use this app." 
          : `Authentication error: ${error}`,
      });
      navigate('/', { replace: true });
      return;
    }

    if (code) {
      const verifier = localStorage.getItem('code_verifier');
      if (verifier) {
        handleTokenExchange(code, verifier);
      } else {
        toast({
          variant: "destructive",
          title: "Authentication Failed",
          description: "Code verifier not found. Please try again.",
        });
        navigate('/', { replace: true });
      }
    } else if (!error) {
      // No code and no error means we landed here without auth flow
      toast({
        variant: "destructive",
        title: "Authentication Failed",
        description: "Invalid callback request. Please try again.",
      });
      navigate('/', { replace: true });
    }
  }, [navigate, handleTokenExchange, searchParams, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-accent/20">
      <div className="text-center p-8 rounded-lg shadow-lg bg-white/80 backdrop-blur-sm">
        <h2 className="text-2xl font-bold mb-4">Connecting to Spotify...</h2>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
      </div>
    </div>
  );
};

export default Callback;