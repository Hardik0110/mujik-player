// src/components/SpotifyAuth.tsx
import { useEffect } from 'react';
import { generateSpotifyAuthUrl, setAccessToken } from '@/services/spotify';

interface SpotifyAuthProps {
  onAuthenticated: (authenticated: boolean) => void;
}

const SpotifyAuth = ({ onAuthenticated }: SpotifyAuthProps) => {
  useEffect(() => {
    // Check for authentication callback
    const hash = window.location.hash;
    if (hash) {
      const token = hash.substring(1).split("&")[0].split("=")[1];
      if (token) {
        setAccessToken(token);
        onAuthenticated(true);
        window.localStorage.setItem('spotify_access_token', token);
        window.location.hash = "";
      }
    } else {
      // Check if we have a stored token
      const storedToken = window.localStorage.getItem('spotify_access_token');
      if (storedToken) {
        setAccessToken(storedToken);
        onAuthenticated(true);
      }
    }
  }, [onAuthenticated]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-accent/20">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-6">Welcome to Mujik Player</h1>
        <p className="text-lg mb-6">Connect with Spotify to start listening to your favorite music</p>
        <a
          href={generateSpotifyAuthUrl()}
          className="bg-green-500 text-white px-6 py-3 rounded-full hover:bg-green-600 transition-colors"
        >
          Connect with Spotify
        </a>
      </div>
    </div>
  );
};

export default SpotifyAuth;