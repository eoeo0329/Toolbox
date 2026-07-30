export interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  cover: string;
  duration: number;
  favorite?: boolean;
}

export interface OrbitalPosition {
  angle: number;
  radius: number;
  orbitIndex: number;
}

export type LongPressAction = 'favorite' | 'next' | 'album' | 'share';
