/**
 * Design Tokens for "Get-to-Know-You"
 * Sampled and matched directly with the visual spec.
 */

export const colors = {
  cream: '#FAF6EA',       // Background canvas (sampled from mockup: #FAF6EA / #FAF5E6)
  ink: '#1A1C22',         // Primary text and black button (#1A1C22 / #1A1A1F)
  mutedGray: '#8A8A93',   // Tagline and subtitle (#8A8A93)
  
  // Player & Theme Accent Colors
  pink: {
    DEFAULT: '#F4A7D3',
    blob: '#F8A6BE',      // Player 1 avatar blob
    heart: '#F7A7C8',     // Decorative heart shape
  },
  yellow: {
    DEFAULT: '#F8D56B',
    crescent: '#F9D76A',  // Crescent moon shape
    spark: '#F9D76A',     // Yellow spark lines
    star: '#FAD768',      // Yellow center starburst
  },
  blue: {
    DEFAULT: '#A9B8F2',   // Periwinkle blue
    blob: '#93ADF9',      // Player 2 avatar blob
    star: '#AABEF5',      // Decorative blue starburst
  },
  green: {
    DEFAULT: '#9DAA5F',   // Olive green
    cross: '#A4B571',     // Decorative cross shape
  }
} as const;

export const typography = {
  fontFamily: 'Nunito, sans-serif',
  weights: {
    hero: 900,       // Huge hero titles (Black)
    question: 800,   // Questions (ExtraBold)
    numbers: 900,    // Large numbers and scores (Black)
    cardTitle: 700,  // Card titles (Bold)
    button: 700,     // Buttons (Bold)
    label: 600,      // Labels (SemiBold)
    body: 400,       // Body descriptions (Regular)
    tiny: 500,       // Tiny metadata (Medium)
  }
} as const;

export const radii = {
  pill: '9999px',
  card: '30px',
  cardLg: '32px',
} as const;

export const dimensions = {
  mobileWidth: 390,
  mobileHeight: 844,
} as const;
