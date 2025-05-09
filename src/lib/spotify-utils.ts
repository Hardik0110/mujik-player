// src/lib/spotify-utils.ts
import { clearTokens } from '@/services/spotify';

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
    
    // This makes the error properties show up in the console
    Object.setPrototypeOf(this, SpotifyError.prototype);
  }
}

const isUnauthenticatedError = (error: SpotifyApiError): boolean => {
  return (
    error.status === 401 || 
    error.statusCode === 401 ||
    error.body?.error?.status === 401 ||
    (error.message && error.message.includes('No token provided')) ||
    (error.message && error.message.includes('The access token expired'))
  );
};

export const handleSpotifyError = (error: SpotifyApiError): never => {
  console.error('Spotify API Error:', error);

  if (isUnauthenticatedError(error)) {
    // Clear invalid tokens
    clearTokens();
    
    // Redirect to login
    window.location.href = '/';
    throw new SpotifyError('Authentication failed. Please login again.', 401);
  } else if (error.status === 404 || error.body?.error?.status === 404) {
    throw new SpotifyError('Resource not found', 404);
  } else if (error.status === 429 || error.body?.error?.status === 429) {
    throw new SpotifyError('Too many requests. Please try again later.', 429);
  } else if (error.status === 403 || error.body?.error?.status === 403) {
    throw new SpotifyError('Access denied. You may not have the necessary permissions.', 403);
  } else {
    throw new SpotifyError(
      error.message || 
      error.body?.error?.message || 
      'An error occurred while playing music'
    );
  }
};