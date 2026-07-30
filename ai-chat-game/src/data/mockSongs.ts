import type { Song } from '../types/music';

// 生成柔和渐变封面 (SVG data URL)
const createCover = (colors: [string, string], pattern?: string) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">
    <defs>
      <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${colors[0]}"/>
        <stop offset="100%" style="stop-color:${colors[1]}"/>
      </linearGradient>
      <radialGradient id="r" cx="30%" cy="30%">
        <stop offset="0%" style="stop-color:rgba(255,255,255,0.4)"/>
        <stop offset="100%" style="stop-color:rgba(255,255,255,0)"/>
      </radialGradient>
    </defs>
    <rect width="400" height="400" fill="url(#g)"/>
    <rect width="400" height="400" fill="url(#r)"/>
    ${pattern || ''}
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

const patterns = [
  `<circle cx="200" cy="200" r="100" fill="rgba(255,255,255,0.15)"/><circle cx="200" cy="200" r="60" fill="rgba(255,255,255,0.1)"/>`,
  `<path d="M50 350 Q200 50 350 350" stroke="rgba(255,255,255,0.3)" fill="none" stroke-width="4"/><path d="M50 380 Q200 80 350 380" stroke="rgba(255,255,255,0.2)" fill="none" stroke-width="3"/>`,
  `<rect x="50" y="50" width="300" height="300" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="2" rx="20"/><rect x="100" y="100" width="200" height="200" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="2" rx="15"/>`,
  `<polygon points="200,80 320,320 80,320" fill="rgba(255,255,255,0.12)"/>`,
  `<circle cx="120" cy="150" r="50" fill="rgba(255,255,255,0.15)"/><circle cx="280" cy="150" r="50" fill="rgba(255,255,255,0.12)"/><circle cx="200" cy="280" r="60" fill="rgba(255,255,255,0.1)"/>`,
  `<line x1="0" y1="100" x2="400" y2="300" stroke="rgba(255,255,255,0.2)" stroke-width="2"/><line x1="0" y1="200" x2="400" y2="200" stroke="rgba(255,255,255,0.15)" stroke-width="2"/><line x1="0" y1="300" x2="400" y2="100" stroke="rgba(255,255,255,0.1)" stroke-width="2"/>`,
  `<path d="M0 200 Q100 100 200 200 T400 200" stroke="rgba(255,255,255,0.3)" fill="none" stroke-width="3"/><path d="M0 250 Q100 150 200 250 T400 250" stroke="rgba(255,255,255,0.2)" fill="none" stroke-width="2"/>`,
  `<circle cx="200" cy="200" r="140" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="1" stroke-dasharray="8,8"/><circle cx="200" cy="200" r="100" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="1" stroke-dasharray="5,5"/><circle cx="200" cy="200" r="60" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="1"/>`,
];

export const mockSongs: Song[] = [
  {
    id: '1',
    title: 'Midnight Dreams',
    artist: 'Luna Wave',
    album: 'Cosmic Journey',
    cover: createCover(['#667eea', '#764ba2'], patterns[0]),
    duration: 245,
    favorite: true,
  },
  {
    id: '2',
    title: 'Neon Horizon',
    artist: 'Synth Rider',
    album: 'Electric Pulse',
    cover: createCover(['#f093fb', '#f5576c'], patterns[1]),
    duration: 198,
  },
  {
    id: '3',
    title: 'Ocean Whispers',
    artist: 'Deep Blue',
    album: 'Aqua Dreams',
    cover: createCover(['#4facfe', '#00f2fe'], patterns[2]),
    duration: 312,
    favorite: true,
  },
  {
    id: '4',
    title: 'Golden Hour',
    artist: 'Sunset Vibes',
    album: 'Golden Collection',
    cover: createCover(['#fa709a', '#fee140'], patterns[3]),
    duration: 276,
  },
  {
    id: '5',
    title: 'Forest Rain',
    artist: 'Nature Echo',
    album: 'Serenity',
    cover: createCover(['#30cfd0', '#330867'], patterns[4]),
    duration: 354,
  },
  {
    id: '6',
    title: 'Starlight Serenade',
    artist: 'Cosmic Band',
    album: 'Galaxy Tour',
    cover: createCover(['#a8edea', '#fed6e3'], patterns[5]),
    duration: 289,
    favorite: true,
  },
  {
    id: '7',
    title: 'Urban Pulse',
    artist: 'City Lights',
    album: 'Metropolitan',
    cover: createCover(['#ff9a9e', '#fecfef'], patterns[6]),
    duration: 223,
  },
  {
    id: '8',
    title: 'Mountain Echo',
    artist: 'Alpine Sound',
    album: 'Peak Experience',
    cover: createCover(['#84fab0', '#8fd3f4'], patterns[7]),
    duration: 301,
  },
  {
    id: '9',
    title: 'Velvet Night',
    artist: 'Jazz Ensemble',
    album: 'Smooth Jazz',
    cover: createCover(['#ffecd2', '#fcb69f'], patterns[0]),
    duration: 267,
  },
  {
    id: '10',
    title: 'Solar Flare',
    artist: 'Energy Core',
    album: 'Power Up',
    cover: createCover(['#ff6e7f', '#bfe9ff'], patterns[1]),
    duration: 199,
    favorite: true,
  },
  {
    id: '11',
    title: 'Crystal Mind',
    artist: 'Clarity',
    album: 'Focus Sessions',
    cover: createCover(['#e0c3fc', '#8ec5fc'], patterns[2]),
    duration: 345,
  },
  {
    id: '12',
    title: 'Desert Wind',
    artist: 'Sahara',
    album: 'Dunes',
    cover: createCover(['#f6d365', '#fda085'], patterns[3]),
    duration: 278,
  },
  {
    id: '13',
    title: 'Cyber Runner',
    artist: 'Neo Tokyo',
    album: '2088',
    cover: createCover(['#5ee7df', '#b490ca'], patterns[4]),
    duration: 211,
  },
  {
    id: '14',
    title: 'Aurora Borealis',
    artist: 'Northern Lights',
    album: 'Arctic',
    cover: createCover(['#c471f5', '#fa71cd'], patterns[5]),
    duration: 322,
    favorite: true,
  },
  {
    id: '15',
    title: 'Coffee Morning',
    artist: 'Cozy Beats',
    album: 'Cafe Sessions',
    cover: createCover(['#d299c2', '#fef9d7'], patterns[6]),
    duration: 256,
  },
  {
    id: '16',
    title: 'Thunder Strike',
    artist: 'Rock Storm',
    album: 'Voltage',
    cover: createCover(['#96deda', '#50c9c3'], patterns[7]),
    duration: 234,
  },
];
