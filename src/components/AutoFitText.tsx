'use client';
import { useEffect, useLayoutEffect, useRef } from 'react';

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

interface AutoFitTextProps {
  text: string;
  className?: string;
  maxFontSize?: number;
  minFontSize?: number;
}

export default function AutoFitText({ text, className = '', maxFontSize = 16, minFontSize = 9 }: AutoFitTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useIsomorphicLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const fit = () => {
      let size = maxFontSize;
      container.style.fontSize = `${size}px`;
      while (size > minFontSize && container.scrollHeight > container.clientHeight) {
        size -= 1;
        container.style.fontSize = `${size}px`;
      }
    };

    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(container);
    return () => observer.disconnect();
  }, [text, maxFontSize, minFontSize]);

  return (
    <div ref={containerRef} className={className}>
      {text}
    </div>
  );
}
