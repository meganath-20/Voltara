import React, { useEffect, useRef, useState } from 'react';

/**
 * Lightweight ScrollReveal component using IntersectionObserver.
 * Triggers reveal animation once element enters viewport.
 */
export function ScrollReveal({
  children,
  className = '',
  threshold = 0.12,
  rootMargin = '0px 0px -40px 0px',
  style = {}
}) {
  const domRef = useRef(null);
  const [isRevealed, setIsRevealed] = useState(false);

  useEffect(() => {
    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setIsRevealed(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsRevealed(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold, rootMargin }
    );

    const currentElem = domRef.current;
    if (currentElem) {
      observer.observe(currentElem);
    }

    return () => {
      if (currentElem) observer.unobserve(currentElem);
    };
  }, [threshold, rootMargin]);

  return (
    <div
      ref={domRef}
      className={`reveal-item ${isRevealed ? 'is-revealed' : ''} ${className}`}
      style={style}
    >
      {children}
    </div>
  );
}
