import { useState, useEffect, useRef } from 'react';

/**
 * Animated count-up hook for dashboard stat numbers.
 * @param {number} end - Target number
 * @param {number} duration - Animation duration in ms (default 1200)
 * @returns {number} Current animated value
 */
export function useCountUp(end, duration = 1200) {
  const [count, setCount] = useState(0);
  const prevEnd = useRef(0);
  const frameRef = useRef(null);

  useEffect(() => {
    if (end === prevEnd.current) return;

    const startVal = prevEnd.current;
    const startTime = performance.now();
    const diff = end - startVal;

    function animate(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(startVal + diff * eased);

      setCount(current);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      } else {
        prevEnd.current = end;
      }
    }

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [end, duration]);

  return count;
}
