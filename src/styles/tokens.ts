/**
 * Design Tokens for "Get-to-Know-You"
 * Sampled and matched directly with the visual spec.
 */

export const colors = {
  cream: '#FAF6EA',       // Background canvas
  ink: '#1A1C22',         // Primary text and black button
  mutedGray: '#8A8A93',   // Tagline and subtitle
  
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
  fontFamily: "'Le Havre Rounded Bold', 'Le Havre Rounded', Nunito, sans-serif",
  headingFamily: "'Proxima Soft Black', 'Proxima Soft', Nunito, sans-serif",
  bodyFamily: "'Le Havre Rounded Bold', 'Le Havre Rounded', Nunito, sans-serif",
  weights: {
    hero: 900,       // Huge hero titles (Proxima Soft Black)
    question: 900,   // Questions (Proxima Soft Black)
    numbers: 900,    // Large numbers and scores (Proxima Soft Black)
    cardTitle: 900,  // Card titles (Proxima Soft Black)
    button: 900,     // Buttons (Proxima Soft Black)
    label: 900,      // Labels (Proxima Soft Black)
    body: 700,       // Body descriptions (Le Havre Rounded Bold)
    tiny: 600,       // Tiny metadata (Le Havre Rounded Medium/Bold)
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
