import { useEffect, useState } from 'react';
import { setAccessToken, refreshAccessToken } from '@/services/spotify';
import { useToast } from '@/components/ui/use-toast';

export function useSpotifyAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('spotify_access_token');
        const refreshToken = localStorage.getItem('spotify_refresh_token');
        const expiresAt = localStorage.getItem('spotify_token_expires_at');

        if (!token || !refreshToken || !expiresAt) {
          setIsInitializing(false);
          return;
        }

        // Check if token is expired or about to expire (within 5 minutes)
        if (Date.now() > Number(expiresAt) - 300000) {
          const data = await refreshAccessToken(refreshToken);
          
          setAccessToken(data.access_token);
          localStorage.setItem('spotify_access_token', data.access_token);
          
          if (data.refresh_token) {
            localStorage.setItem('spotify_refresh_token', data.refresh_token);
          }
          
          if (data.expires_in) {
            const newExpiresAt = Date.now() + (data.expires_in * 1000);
            localStorage.setItem('spotify_token_expires_at', newExpiresAt.toString());
          }
        } else {
          setAccessToken(token);
        }

        setIsAuthenticated(true);
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        // Clear invalid tokens
        localStorage.removeItem('spotify_access_token');
        localStorage.removeItem('spotify_refresh_token');
        localStorage.removeItem('spotify_token_expires_at');
        
        toast({
          variant: "destructive",
          title: "Authentication Error",
          description: "Please log in again.",
        });
      } finally {
        setIsInitializing(false);
      }
    };

    initializeAuth();
  }, [toast]);

  return {
    isAuthenticated,
    setIsAuthenticated,
    isInitializing
  };
}
