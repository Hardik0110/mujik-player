import SpotifyWebApi from 'spotify-web-api-node';

const spotifyApi = new SpotifyWebApi({
  clientId: 'f29485f82aba428f9f058c89fa168371',
  redirectUri: 'http://localhost:8080/callback'
});

export const generateSpotifyAuthUrl = () => {
  const scopes = ['user-read-private', 'user-read-email', 'streaming', 'user-modify-playback-state', 'user-read-playback-state'];
  return spotifyApi.createAuthorizeURL(scopes, '');
};

export const setAccessToken = (token: string) => {
  spotifyApi.setAccessToken(token);
};

export const searchTracks = async (query: string) => {
  try {
    const response = await spotifyApi.searchTracks(query);
    return response.body.tracks?.items.map(track => ({
      id: track.id,
      title: track.name,
      artist: track.artists[0].name,
      album: track.album.name,
      duration: track.duration_ms,
      cover: track.album.images[0]?.url,
      previewUrl: track.preview_url,
      uri: track.uri
    })) || [];
  } catch (error) {
    console.error('Error searching tracks:', error);
    return [];
  }
};

export default spotifyApi;