import {useEffect, useRef, useState} from 'react';
import {EdgeWithClass} from '../types';
import * as styles from '../App.css';

interface DependencyLinesProps {
  edges: EdgeWithClass[];
  selectedFolder: string | null;
  rootDir: string;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

export function DependencyLines({edges, selectedFolder, rootDir, containerRef}: DependencyLinesProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({width: 0, height: 0});

  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver(() => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({width: rect.width, height: rect.height});
      }
    });

    resizeObserver.observe(containerRef.current);

    // Initial measurement
    const rect = containerRef.current.getBoundingClientRect();
    setDimensions({width: rect.width, height: rect.height});

    return () => resizeObserver.disconnect();
  }, [containerRef]);

  useEffect(() => {
    drawLines();
  }, [edges, selectedFolder, dimensions]);

  const drawLines = () => {
    if (!svgRef.current || !containerRef.current) return;

    const svg = svgRef.current;
    const container = containerRef.current;

    // Clear existing content
    svg.innerHTML = '';

    const containerRect = container.getBoundingClientRect();

    // Create defs section for gradients
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    svg.appendChild(defs);

    let gradientCounter = 0;

    edges.forEach((edge) => {
      const fromEl = document.querySelector<HTMLElement>(`[data-file-path="${edge.from}"] span`);
      const toEl = document.querySelector<HTMLElement>(`[data-file-path="${edge.to}"] span`);

      if (!fromEl || !toEl) return;

      // Filter based on selected folder
      if (selectedFolder) {
        const fromLi = fromEl.parentElement;
        const toLi = toEl.parentElement;
        const fromFolder = fromLi?.getAttribute('data-folder');
        const toFolder = toLi?.getAttribute('data-folder');
        if (fromFolder !== selectedFolder && toFolder !== selectedFolder) {
          return;
        }
      }

      const fromRect = fromEl.getBoundingClientRect();
      const toRect = toEl.getBoundingClientRect();

      const x1 = fromRect.left - containerRect.left + fromRect.width + 4;
      const y1 = fromRect.top - containerRect.top + 2;
      const x2 = toRect.left - containerRect.left + toRect.width + 4;
      const y2 = toRect.top - containerRect.top + toRect.height - 2;

      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');

      // Create arc to the right of the tree
      const midX = Math.max(x1, x2) + 400;
      const controlOffset = 50;

      // Path: start -> arc right to midpoint -> arc back to end
      const midY = (y1 + y2) / 2;
      const d = `M ${x1} ${y1} C ${x1 + controlOffset} ${y1}, ${midX - controlOffset} ${y1}, ${midX} ${midY} S ${midX - controlOffset} ${y2}, ${x2} ${y2}`;

      path.setAttribute('d', d);

      // Create gradient
      const gradientId = `gradient${gradientCounter++}`;
      const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
      gradient.setAttribute('id', gradientId);
      gradient.setAttribute('gradientUnits', 'userSpaceOnUse');
      gradient.setAttribute('x1', String(x1));
      gradient.setAttribute('y1', String(y1));
      gradient.setAttribute('x2', String(x2));
      gradient.setAttribute('y2', String(y2));

      // Define colors based on edge type
      let startColor: string, endColor: string;
      if (edge.class === 'import-type') {
        startColor = '#9c27b0'; // Purple
        endColor = '#00e676'; // Green
      } else if (edge.class === 'import-side-effect') {
        startColor = '#ff6f00'; // Orange
        endColor = '#2196f3'; // Blue
      } else {
        startColor = '#e91e63'; // Magenta/Pink
        endColor = '#00bcd4'; // Cyan
      }

      const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
      stop1.setAttribute('offset', '0%');
      stop1.setAttribute('style', `stop-color:${startColor};stop-opacity:1`);

      const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
      stop2.setAttribute('offset', '100%');
      stop2.setAttribute('style', `stop-color:${endColor};stop-opacity:1`);

      gradient.appendChild(stop1);
      gradient.appendChild(stop2);
      defs.appendChild(gradient);

      // Use gradient for stroke
      path.setAttribute('stroke', `url(#${gradientId})`);
      path.setAttribute('stroke-width', '2');
      path.setAttribute('fill', 'none');
      path.setAttribute('opacity', '0.6');
      if (edge.class === 'import-side-effect') {
        path.setAttribute('stroke-dasharray', '5,5');
      }
      path.setAttribute('class', styles.dependencyLine);
      path.setAttribute('pointer-events', 'stroke');

      const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
      const normalizedFrom = edge.from.replace(rootDir + '/', '');
      const normalizedTo = edge.to.replace(rootDir + '/', '');
      title.textContent = `${normalizedFrom} → ${normalizedTo}`;
      path.appendChild(title);

      svg.appendChild(path);
    });
  };

  return <svg ref={svgRef} className={styles.dependencySvg} width={dimensions.width} height={dimensions.height} />;
}
