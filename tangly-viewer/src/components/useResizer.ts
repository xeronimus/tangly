import React, {useEffect} from 'react';

export default function useResizer(
  observedDiv: React.RefObject<HTMLDivElement | null>,
  deps: React.DependencyList,
  onResizeCb: () => void
): void {
  useEffect(() => {
    if (!observedDiv.current) return;

    const resizeObserver = new ResizeObserver(() => {
      onResizeCb();
    });

    resizeObserver.observe(observedDiv.current);

    // Initial calculation
    onResizeCb();

    return () => resizeObserver.disconnect();
  }, deps);
}
