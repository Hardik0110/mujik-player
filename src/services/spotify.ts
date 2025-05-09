// src/services/spotify.ts
import SpotifyWebApi from 'spotify-web-api-node';
import { Song } from '@/types/song';
import { handleSpotifyError } from '@/lib/spotify-utils';
import { generateCodeChallenge, generateCodeVerifier } from '@/lib/pkce';

const CLIENT_ID = 'f29485f82aba428f9f058c89fa168371';
// Using network IP and current port
const REDIRECT_URI = 'https://192.168.1.16:5174/callback';

interface SpotifyTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

const spotifyApi = new SpotifyWebApi({
  clientId: CLIENT_ID,
  redirectUri: REDIRECT_URI
});

export const refreshAccessToken = async (refreshToken: string): Promise<SpotifyTokenResponse> => {
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
    throw new Error('Failed to refresh token');
  }

  return response.json();
};

export const generateSpotifyAuthUrl = async (): Promise<string> => {
  const scopes = ['user-read-private', 'user-read-email', 'streaming', 'user-modify-playback-state', 'user-read-playback-state'];
  
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
};

export const setAccessToken = (token: string): void => {
  spotifyApi.setAccessToken(token);
};

const ensureValidToken = async () => {
  const expiresAt = localStorage.getItem('spotify_token_expires_at');
  const refreshToken = localStorage.getItem('spotify_refresh_token');
  
  if (!expiresAt || !refreshToken) {
    throw new Error('No valid token found');
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
  }
};

export const searchTracks = async (query: string): Promise<Song[]> => {
  try {
    await ensureValidToken();
    const response = await spotifyApi.searchTracks(query);
    return response.body.tracks?.items.map(track => ({
      id: track.id,
      title: track.name,
      artist: track.artists[0].name,
      album: track.album.name,
      duration: track.duration_ms,
      cover: track.album.images[0]?.url || '',
      previewUrl: track.preview_url,
      uri: track.uri
    })) || [];
  } catch (error) {
    console.error('Error searching tracks:', error);
    handleSpotifyError(error);
    return [];
  }
};

export const playTrack = async (uri: string, deviceId?: string): Promise<void> => {
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
    await spotifyApi.skipToNext();
  } catch (error) {
    handleSpotifyError(error);
  }
};

export const skipToPrevious = async (): Promise<void> => {
  try {
    await spotifyApi.skipToPrevious();
  } catch (error) {
    handleSpotifyError(error);
  }
};

export const setVolume = async (volumePercent: number): Promise<void> => {
  try {
    await ensureValidToken();
    await spotifyApi.setVolume(Math.round(volumePercent * 100));
  } catch (error) {
    handleSpotifyError(error);
  }
};

export const seekToPosition = async (positionMs: number): Promise<void> => {
  try {
    await ensureValidToken();
    await spotifyApi.seek(positionMs);
  } catch (error) {
    handleSpotifyError(error);
  }
};

export const getTrackInfo = async (trackId: string): Promise<Song | null> => {
  try {
    const response = await spotifyApi.getTrack(trackId);
    const track = response.body;
    
    return {
      id: track.id,
      title: track.name,
      artist: track.artists[0].name,
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

