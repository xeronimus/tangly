import React, {useEffect, useState} from 'react';
import {EdgeWithClass} from '../types';

interface DependencyLinesProps {
  edges: EdgeWithClass[];
  selectedFolder: string | null;
  rootDir: string;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

interface LineSegment {
  left: number;
  top: number;
  width: number;
  height: number;
  color: string;
  isDashed: boolean;
  title: string;
  borders: {
    top: boolean;
    right: boolean;
    bottom: boolean;
  };
  isEndSegment: boolean; // true if this is the segment that ends at the target file
}

export function DependencyLines({edges, selectedFolder, rootDir, containerRef}: DependencyLinesProps) {
  const [segments, setSegments] = useState<LineSegment[]>([]);

  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver(() => {
      calculateLines();
    });

    resizeObserver.observe(containerRef.current);

    // Initial calculation
    calculateLines();

    return () => resizeObserver.disconnect();
  }, [containerRef, edges, selectedFolder]);

  const calculateLines = () => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const containerRect = container.getBoundingClientRect();
    const calculatedSegments: LineSegment[] = [];

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

      // Calculate positions relative to container
      // Start point: end of 'from' filename
      const x1 = fromRect.left - containerRect.left + fromRect.width + 4;
      const y1 = fromRect.top - containerRect.top + 2;

      // End point: end of 'to' filename
      const x2 = toRect.left - containerRect.left + toRect.width + 4;
      const y2 = toRect.top - containerRect.top + toRect.height - 2;

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

      const normalizedFrom = edge.from.replace(rootDir + '/', '');
      const normalizedTo = edge.to.replace(rootDir + '/', '');
      const title = `${normalizedFrom} → ${normalizedTo}`;

      const isDashed = edge.class === 'import-side-effect';

      // Create two divs per line:
      // 1. First div: from file -> right and down/up (top + right borders)
      // 2. Second div: bottom of curve -> back left to target file (bottom border only)

      const extendRight = 400; // How far to extend to the right
      const rightX = Math.max(x1, x2) + extendRight;

      if (y1 <= y2) {
        // From file is above or at same level as to file
        // Segment 1: top-right corner (from file going right and down)
        calculatedSegments.push({
          left: x1,
          top: y1,
          width: rightX - x1,
          height: y2 - y1,
          color: startColor,
          isDashed,
          title,
          borders: {
            top: true,
            right: true,
            bottom: false
          },
          isEndSegment: false
        });

        // Segment 2: bottom-left line (from right side back to target file)
        calculatedSegments.push({
          left: x2,
          top: y2,
          width: rightX - x2,
          height: 0,
          color: endColor,
          isDashed,
          title,
          borders: {
            top: false,
            right: false,
            bottom: true
          },
          isEndSegment: true
        });
      } else {
        // From file is below to file
        // Segment 1: bottom-right corner (from file going right and up)
        calculatedSegments.push({
          left: x1,
          top: y2,
          width: rightX - x1,
          height: y1 - y2,
          color: startColor,
          isDashed,
          title,
          borders: {
            top: false,
            right: true,
            bottom: true
          },
          isEndSegment: false
        });

        // Segment 2: top-left line (from right side back to target file)
        calculatedSegments.push({
          left: x2,
          top: y2,
          width: rightX - x2,
          height: 0,
          color: endColor,
          isDashed,
          title,
          borders: {
            top: true,
            right: false,
            bottom: false
          },
          isEndSegment: true
        });
      }
    });

    setSegments(calculatedSegments);
  };

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        overflow: 'visible'
      }}
    >
      {segments.map((segment, index) => {
        const borderStyle = `2px ${segment.isDashed ? 'dashed' : 'solid'} ${segment.color}`;
        const arrowSize = 4; // Size of the arrow head

        return (
          <React.Fragment key={index}>
            <div
              title={segment.title}
              style={{
                position: 'absolute',
                left: `${segment.left}px`,
                top: `${segment.top}px`,
                width: `${segment.width}px`,
                height: segment.height > 0 ? `${segment.height}px` : 0,
                borderTop: segment.borders.top ? borderStyle : 'none',
                borderRight: segment.borders.right ? borderStyle : 'none',
                borderBottom: segment.borders.bottom ? borderStyle : 'none',
                borderLeft: 'none',
                opacity: 0.6,
                pointerEvents: 'auto',
                boxSizing: 'border-box'
              }}
            />
            {/* Arrow head at the end of the line (pointing left) */}
            {segment.isEndSegment && (
              <div
                title={segment.title}
                style={{
                  position: 'absolute',
                  left: `${segment.left - arrowSize}px`,
                  top: `${segment.top - arrowSize / 2 - 1}px`,
                  width: 0,
                  height: 0,
                  borderTop: `${arrowSize}px solid transparent`,
                  borderBottom: `${arrowSize}px solid transparent`,
                  borderRight: `${arrowSize}px solid ${segment.color}`,
                  opacity: 0.6,
                  pointerEvents: 'none'
                }}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
