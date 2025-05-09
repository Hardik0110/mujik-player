export interface WebPlaybackPlayer {
  device_id: string;
  name: string;
  getOAuthToken(cb: (token: string) => void): void;
  connect(): Promise<boolean>;
  disconnect(): void;
  addListener(event: 'ready', callback: (data: { device_id: string }) => void): void;
  addListener(event: 'not_ready', callback: (data: { device_id: string }) => void): void;
  addListener(event: 'player_state_changed', callback: (state: WebPlaybackState | null) => void): void;
  addListener(event: 'authentication_error', callback: (data: { message: string }) => void): void;
  addListener(event: 'account_error', callback: (data: { message: string }) => void): void;
  removeListener(event: 'ready' | 'not_ready' | 'player_state_changed', callback: (state: WebPlaybackState | null) => void): void;
  getCurrentState(): Promise<WebPlaybackState | null>;
  setName(name: string): Promise<void>;
  getVolume(): Promise<number>;
  setVolume(volume: number): Promise<void>;
  pause(): Promise<void>;
  resume(): Promise<void>;
  togglePlay(): Promise<void>;
  seek(position_ms: number): Promise<void>;
  previousTrack(): Promise<void>;
  nextTrack(): Promise<void>;
}

export interface WebPlaybackState {
  context: {
    uri: string;
    metadata: Record<string, unknown>;
  };
  disallows: {
    pausing: boolean;
    peeking_next: boolean;
    peeking_prev: boolean;
    resuming: boolean;
    seeking: boolean;
    skipping_next: boolean;
    skipping_prev: boolean;
  };
  duration: number;
  paused: boolean;
  position: number;
  repeat_mode: number;
  shuffle: boolean;
  track_window: {
    current_track: WebPlaybackTrack;
    previous_tracks: WebPlaybackTrack[];
    next_tracks: WebPlaybackTrack[];
  };
}

export interface WebPlaybackTrack {
  id: string;
  uri: string;
  type: string;
  linked_from_uri: string | null;
  linked_from: {
    uri: string | null;
    id: string | null;
  };
  media_type: string;
  name: string;
  duration_ms: number;
  artists: WebPlaybackArtist[];
  album: WebPlaybackAlbum;
  is_playable: boolean;
}

export interface WebPlaybackAlbum {
  uri: string;
  name: string;
  images: { url: string }[];
}

export interface WebPlaybackArtist {
  uri: string;
  name: string;
}

declare global {
  interface Window {
    Spotify: {
      Player: new (config: {
        name: string;
        getOAuthToken(cb: (token: string) => void): void;
        volume?: number;
      }) => WebPlaybackPlayer;
    };
    onSpotifyWebPlaybackSDKReady: () => void;
    player: WebPlaybackPlayer;
  }
}
