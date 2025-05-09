// src/services/spotify.ts
import SpotifyWebApi from 'spotify-web-api-node';
import { Song } from '@/types/song';
import { handleSpotifyError } from '@/lib/spotify-utils';
import { generateCodeChallenge, generateCodeVerifier } from '@/lib/pkce';

const CLIENT_ID = 'f29485f82aba428f9f058c89fa168371';
// Using network IP and current port - consider making this environment variable
const REDIRECT_URI = 'https://192.168.1.16:5174/callback';

export interface SpotifyTokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
}

const spotifyApi = new SpotifyWebApi({
  clientId: CLIENT_ID,
  redirectUri: REDIRECT_URI
});

export const refreshAccessToken = async (refreshToken: string): Promise<SpotifyTokenResponse> => {
  try {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: CLIENT_ID,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error_description || 'Failed to refresh token');
    }

    return response.json();
  } catch (error) {
    console.error('Token refresh failed:', error);
    throw new Error('Failed to refresh access token');
  }
};

export const generateSpotifyAuthUrl = async (): Promise<string> => {
  try {
    const scopes = [
      'user-read-private', 
      'user-read-email', 
      'streaming', 
      'user-modify-playback-state', 
      'user-read-playback-state'
    ];
    
    // Generate PKCE values
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = await generateCodeChallenge(codeVerifier);
    
    // Store code verifier to be used after redirect
    localStorage.setItem('code_verifier', codeVerifier);
    
    // Construct authorization URL
    const authUrl = new URL('https://accounts.spotify.com/authorize');
    
    // Add query parameters
    authUrl.searchParams.append('client_id', CLIENT_ID);
    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append('redirect_uri', REDIRECT_URI);
    authUrl.searchParams.append('scope', scopes.join(' '));
    authUrl.searchParams.append('code_challenge_method', 'S256');
    authUrl.searchParams.append('code_challenge', codeChallenge);
    
    return authUrl.toString();
  } catch (error) {
    console.error('Failed to generate auth URL:', error);
    throw new Error('Authentication preparation failed');
  }
};

export const setAccessToken = (token: string): void => {
  if (!token) {
    console.error('Attempted to set empty access token');
    return;
  }
  spotifyApi.setAccessToken(token);
};

export const getStoredTokens = () => {
  const accessToken = localStorage.getItem('spotify_access_token');
  const refreshToken = localStorage.getItem('spotify_refresh_token');
  const expiresAt = localStorage.getItem('spotify_token_expires_at');
  
  return { accessToken, refreshToken, expiresAt: expiresAt ? Number(expiresAt) : null };
};

export const storeTokens = (tokens: SpotifyTokenResponse) => {
  localStorage.setItem('spotify_access_token', tokens.access_token);
  
  if (tokens.refresh_token) {
    localStorage.setItem('spotify_refresh_token', tokens.refresh_token);
  }
  
  if (tokens.expires_in) {
    const expiresAt = Date.now() + (tokens.expires_in * 1000);
    localStorage.setItem('spotify_token_expires_at', expiresAt.toString());
  }
};

export const clearTokens = () => {
  localStorage.removeItem('spotify_access_token');
  localStorage.removeItem('spotify_refresh_token');
  localStorage.removeItem('spotify_token_expires_at');
};

const ensureValidToken = async (): Promise<string> => {
  const { accessToken, refreshToken, expiresAt } = getStoredTokens();
  
  if (!accessToken || !refreshToken) {
    throw new Error('No valid token found');
  }

  // If token exists but is expired or about to expire (within 5 minutes)
  if (!expiresAt || Date.now() > expiresAt - 300000) {
    try {
      const data = await refreshAccessToken(refreshToken);
      setAccessToken(data.access_token);
      storeTokens(data);
      return data.access_token;
    } catch (error) {
      clearTokens();
      throw new Error('Session expired. Please login again.');
    }
  }
  
  // Set the token in the API instance
  setAccessToken(accessToken);
  return accessToken;
};

export const searchTracks = async (query: string): Promise<Song[]> => {
  if (!query.trim()) {
    return [];
  }
  
  try {
    await ensureValidToken();
    const response = await spotifyApi.searchTracks(query);
    
    if (!response.body.tracks?.items.length) {
      return [];
    }
    
    return response.body.tracks.items.map(track => ({
      id: track.id,
      title: track.name,
      artist: track.artists.map(a => a.name).join(', '),
      album: track.album.name,
      duration: track.duration_ms,
      cover: track.album.images[0]?.url || '',
      previewUrl: track.preview_url,
      uri: track.uri
    }));
  } catch (error) {
    console.error('Error searching tracks:', error);
    handleSpotifyError(error);
    return [];
  }
};

export const playTrack = async (uri: string, deviceId?: string): Promise<void> => {
  if (!uri) {
    throw new Error('Track URI is required');
  }
  
  try {
    await ensureValidToken();
    
    if (!deviceId) {
      throw new Error('No active device found');
    }
    
    // First, ensure the device is active
    await spotifyApi.transferMyPlayback([deviceId], { play: true });
    
    // Then start playback
    await spotifyApi.play({
      device_id: deviceId,
      uris: [uri]
    });
  } catch (error) {
    console.error('Playback error:', error);
    handleSpotifyError(error);
  }
};

export const pausePlayback = async (): Promise<void> => {
  try {
    await ensureValidToken();
    await spotifyApi.pause();
  } catch (error) {
    handleSpotifyError(error);
  }
};

export const resumePlayback = async (): Promise<void> => {
  try {
    await ensureValidToken();
    await spotifyApi.play();
  } catch (error) {
    handleSpotifyError(error);
  }
};

export const skipToNext = async (): Promise<void> => {
  try {
    await ensureValidToken();
    await spotifyApi.skipToNext();
  } catch (error) {
    handleSpotifyError(error);
  }
};

export const skipToPrevious = async (): Promise<void> => {
  try {
    await ensureValidToken();
    await spotifyApi.skipToPrevious();
  } catch (error) {
    handleSpotifyError(error);
  }
};

export const setVolume = async (volumePercent: number): Promise<void> => {
  if (volumePercent < 0 || volumePercent > 1) {
    throw new Error('Volume must be between 0 and 1');
  }
  
  try {
    await ensureValidToken();
    await spotifyApi.setVolume(Math.round(volumePercent * 100));
  } catch (error) {
    handleSpotifyError(error);
  }
};

export const seekToPosition = async (positionMs: number): Promise<void> => {
  if (positionMs < 0) {
    throw new Error('Position must be positive');
  }
  
  try {
    await ensureValidToken();
    await spotifyApi.seek(positionMs);
  } catch (error) {
    handleSpotifyError(error);
  }
};

export const getTrackInfo = async (trackId: string): Promise<Song | null> => {
  if (!trackId) {
    return null;
  }
  
  try {
    await ensureValidToken();
    const response = await spotifyApi.getTrack(trackId);
    const track = response.body;
    
    return {
      id: track.id,
      title: track.name,
      artist: track.artists.map(a => a.name).join(', '),
      album: track.album.name,
      duration: track.duration_ms,
      cover: track.album.images[0]?.url || '',
      previewUrl: track.preview_url,
      uri: track.uri
    };
  } catch (error) {
    handleSpotifyError(error);
    return null;
  }
};

export default spotifyApi;