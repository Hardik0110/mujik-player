// src/services/spotify.ts
import SpotifyWebApi from 'spotify-web-api-node';
import { Song } from '@/types/song';
import { handleSpotifyError } from '@/lib/spotify-utils';

const CLIENT_ID = 'f29485f82aba428f9f058c89fa168371';
// Updated to use explicit IPv4 loopback address
const REDIRECT_URI = 'http://192.168.1.12:8080/callback';

const spotifyApi = new SpotifyWebApi({
  clientId: CLIENT_ID,
  redirectUri: REDIRECT_URI
});

export const generateSpotifyAuthUrl = (): string => {
  const scopes = ['user-read-private', 'user-read-email', 'streaming', 'user-modify-playback-state', 'user-read-playback-state'];
  
  // The createAuthorizeURL doesn't exist in some versions, so we'll construct it manually
  const authUrl = new URL('https://accounts.spotify.com/authorize');
  
  // Add query parameters
  authUrl.searchParams.append('client_id', CLIENT_ID);
  authUrl.searchParams.append('response_type', 'token');
  authUrl.searchParams.append('redirect_uri', REDIRECT_URI);
  authUrl.searchParams.append('scope', scopes.join(' '));
  
  return authUrl.toString();
};

export const setAccessToken = (token: string): void => {
  spotifyApi.setAccessToken(token);
};

export const searchTracks = async (query: string): Promise<Song[]> => {
  try {
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

// Rest of the functions remain the same
export const playTrack = async (uri: string, deviceId?: string): Promise<void> => {
  try {
    if (deviceId) {
      await spotifyApi.play({
        device_id: deviceId,
        uris: [uri]
      });
    } else {
      await spotifyApi.play({
        uris: [uri]
      });
    }
  } catch (error) {
    handleSpotifyError(error);
  }
};

export const pausePlayback = async (): Promise<void> => {
  try {
    await spotifyApi.pause();
  } catch (error) {
    handleSpotifyError(error);
  }
};

export const resumePlayback = async (): Promise<void> => {
  try {
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
    await spotifyApi.setVolume(Math.round(volumePercent * 100));
  } catch (error) {
    handleSpotifyError(error);
  }
};

export const seekToPosition = async (positionMs: number): Promise<void> => {
  try {
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

