import { useEffect, useState } from 'react';

export default function TopBar({ title, subtitle, actions }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div
      className={`sticky top-0 z-30 h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 transition-shadow ${
        scrolled ? 'shadow-sm' : ''
      }`}
    >
      <div>
        <h2 className="font-heading font-bold text-xl text-navy leading-tight">{title}</h2>
        {subtitle && <div className="text-sm text-slate-500 font-body">{subtitle}</div>}
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </div>
  );
}
