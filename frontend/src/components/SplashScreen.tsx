import { useState, useEffect } from 'react';
import type { FC } from 'react';

interface SplashScreenProps {
  onComplete: () => void;
  durationMs?: number;
}

export const SplashScreen: FC<SplashScreenProps> = ({
  onComplete,
  durationMs = 2400
}) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Trigger exit animation shortly before completion
    const exitTimer = setTimeout(() => {
      setIsExiting(true);
    }, durationMs - 500);

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

      {/* Main Banner Card */}
      <div className="splash-content-box">
        <div className="splash-banner-wrapper">
          <img 
            src="/satquery_hero_bg.png" 
            alt="SatQuery AI - Earth Insights Made Simple" 
            className="splash-banner-img"
          />
          <div className="splash-light-sheen" />
        </div>
      </div>
    </div>
  );
};
