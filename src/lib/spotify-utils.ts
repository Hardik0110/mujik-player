export class SpotifyError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'SpotifyError';
  }
}

export const handleSpotifyError = (error: any) => {
  if (error.status === 401) {
    // Token expired or invalid
    window.location.href = '/'; // Redirect to login
    throw new SpotifyError('Authentication failed. Please login again.', 401);
  } else if (error.status === 404) {
    throw new SpotifyError('Resource not found', 404);
  } else {
    console.error('Spotify API Error:', error);
    throw new SpotifyError('An error occurred while playing music');
  }
};