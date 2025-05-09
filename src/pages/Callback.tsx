import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { setAccessToken } from '@/services/spotify';

interface CallbackProps {
  onAuthenticated: () => void;
}

const Callback = ({ onAuthenticated }: CallbackProps) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  useEffect(() => {
    const handleTokenExchange = async (code: string, verifier: string) => {
      try {
        const response = await fetch('https://accounts.spotify.com/api/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            client_id: 'f29485f82aba428f9f058c89fa168371',
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: 'https://192.168.1.16:5174/callback',
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
        localStorage.setItem('spotify_access_token', data.access_token);
        if (data.refresh_token) {
          localStorage.setItem('spotify_refresh_token', data.refresh_token);
        }
        if (data.expires_in) {
          const expiresAt = Date.now() + (data.expires_in * 1000);
          localStorage.setItem('spotify_token_expires_at', expiresAt.toString());
        }

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
    };

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
    }
  }, [navigate, onAuthenticated, searchParams, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Connecting to Spotify...</h2>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
      </div>
    </div>
  );
};

export default Callback;
