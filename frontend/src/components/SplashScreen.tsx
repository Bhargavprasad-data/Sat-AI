import { useState, useEffect } from 'react';
import type { FC } from 'react';

interface SplashScreenProps {
  onComplete: () => void;
  durationMs?: number;
}

export const SplashScreen: FC<SplashScreenProps> = ({
  onComplete,
  durationMs = 2800
}) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Trigger exit animation shortly before completion
    const exitTimer = setTimeout(() => {
      setIsExiting(true);
    }, durationMs - 550);

    // Call onComplete when fully finished
    const completeTimer = setTimeout(() => {
      onComplete();
    }, durationMs);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(completeTimer);
    };
  }, [durationMs, onComplete]);

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => {
      onComplete();
    }, 250);
  };

  const titleWhite = ['S', 'a', 't', 'Q', 'u', 'e', 'r', 'y'];
  const titleGreen = ['A', 'I'];

  return (
    <div 
      className={`splash-screen-container ${isExiting ? 'splash-exiting' : ''}`}
      onClick={handleDismiss}
      role="banner"
      aria-label="Welcome to SatQuery AI"
    >
      {/* Dynamic Cosmic Backdrop Glows */}
      <div className="splash-ambient-glow glow-1" />
      <div className="splash-ambient-glow glow-2" />
      <div className="splash-grid-mesh" />

      {/* Main Cinematic Logo & Text Reveal Box */}
      <div className="splash-reveal-card">
        <div className="splash-brand-hero-row">
          {/* Glowing Circular Emblem */}
          <div className="splash-emblem-wrapper">
            <div className="splash-emblem-ring" />
            <img 
              src="/logo_symbol.png" 
              alt="SatQuery AI Logo Emblem" 
              className="splash-emblem-img"
            />
          </div>

          {/* Staggered Letter-by-Letter Title */}
          <div className="splash-text-column">
            <div className="splash-title-row">
              <span className="splash-letters-group splash-white">
                {titleWhite.map((char, i) => (
                  <span 
                    key={`w-${i}`} 
                    className="splash-letter"
                    style={{ animationDelay: `${100 + i * 65}ms` }}
                  >
                    {char}
                  </span>
                ))}
              </span>

              <span className="splash-space">&nbsp;</span>

              <span className="splash-letters-group splash-green">
                {titleGreen.map((char, i) => (
                  <span 
                    key={`g-${i}`} 
                    className="splash-letter splash-letter-ai"
                    style={{ animationDelay: `${100 + (titleWhite.length + i) * 65 + 40}ms` }}
                  >
                    {char}
                  </span>
                ))}
              </span>
            </div>

            {/* Accent Line under 'Sat' */}
            <div className="splash-accent-bar-track">
              <div className="splash-accent-bar-fill" />
            </div>

            {/* Subtitle Tagline */}
            <div className="splash-tagline">
              <span>EARTH INSIGHTS MADE SIMPLE</span>
            </div>
          </div>
        </div>

        {/* Shimmer Light Scan */}
        <div className="splash-card-sheen" />
      </div>
    </div>
  );
};

