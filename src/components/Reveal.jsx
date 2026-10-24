import { useEffect, useRef, useState } from 'react';
import usePrefersReducedMotion from '../hooks/usePrefersReducedMotion';

/**
 * Reveals its children the first time they scroll into view.
 * Cards inside inherit a staggered entrance via the --card-index variable.
 */
export default function Reveal({ children, className = '', ...props }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (reducedMotion) {
      setVisible(true);
      return undefined;
    }

    const element = ref.current;
    if (!element) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '0px 0px 10% 0px', threshold: 0.01 },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [reducedMotion]);

  return (
    <div
      ref={ref}
      className={`reveal ${visible ? 'is-visible' : ''} ${className}`.trim()}
      {...props}
    >
      {children}
    </div>
  );
}
