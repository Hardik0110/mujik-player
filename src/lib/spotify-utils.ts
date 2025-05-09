interface SpotifyApiError {
  status?: number;
  message?: string;
  statusCode?: number;
  body?: {
    error?: {
      status: number;
      message: string;
    };
  };
}

export class SpotifyError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'SpotifyError';
  }
}

export const handleSpotifyError = (error: SpotifyApiError) => {
  console.error('Spotify API Error:', error);

  if (error.status === 401 || error.message?.includes('No token provided')) {
    // Clear invalid tokens
    window.localStorage.removeItem('spotify_access_token');
    window.localStorage.removeItem('spotify_refresh_token');
    window.localStorage.removeItem('spotify_token_expires_at');
    
    // Redirect to login
    window.location.href = '/';
    throw new SpotifyError('Authentication failed. Please login again.', 401);
  } else if (error.status === 404) {
    throw new SpotifyError('Resource not found', 404);
  } else {
    throw new SpotifyError('An error occurred while playing music');
  }
};