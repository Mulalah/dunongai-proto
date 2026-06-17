// Brand logo. SVGs live in /public/brand and are referenced by absolute path
// so they work the same in dev and production builds.
//   variant="dark"     → white wordmark, for dark backgrounds (default)
//   variant="light"    → navy wordmark, for light backgrounds
//   variant="stacked"  → wordmark + tagline lockup (navy, light bg only)
//   variant="mark"     → icon only
const SRC = {
  dark: '/brand/logo-horizontal-dark.svg',
  light: '/brand/logo-horizontal.svg',
  stacked: '/brand/logo-stacked.svg',
  mark: '/brand/logo-mark.svg'
};

export default function Logo({ variant = 'dark', className = 'h-9 w-auto' }) {
  return <img src={SRC[variant] || SRC.dark} alt="DunongAI" className={className} draggable={false} />;
}
