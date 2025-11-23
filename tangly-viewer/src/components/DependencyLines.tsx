import React, {useState} from 'react';
import {EdgeClass, EdgeWithClass} from '../types.ts';
import * as styles from './DependencyLines.css';
import useResizer from './useResizer.ts';
import css from '../utils/asCSSProperties.ts';
import {borderRadius} from './DependencyLines.css';

interface NDependencyLinesProps {
  edges: EdgeWithClass[];
  containerRef: React.RefObject<HTMLDivElement | null>;
}

const DependencyLines = ({edges, containerRef}: NDependencyLinesProps) => {
  const [theLines, setTheLines] = useState<DependencyLine[]>([]);

  const calculateLines = () => {
    if (!containerRef.current) return;

    const lineContainerRect = containerRef.current.getBoundingClientRect();

    setTheLines(edgesToDependencyLines(edges, lineContainerRect));
  };

  useResizer(containerRef, [containerRef, edges], calculateLines);

  return (
    <div className={styles.dependencyLinesContainer}>
      {theLines.map((d, i) => (
        <React.Fragment key={i}>
          {[d.segmentOne, d.segmentTwo, d.segmentThree].map((dls: DependencyLineSegment) => (
            <div
              onClick={() => console.log(d)}
              title={`${d.fromPath} → ${d.toPath}`}
              key={`line-${i}:${dls.type}`}
              className={`${styles.lineBoxVariants[dls.type]} dls-${dls.class}`}
              style={css({
                width: `${dls.width}px`,
                height: `${dls.height}px`,
                '--startX': `${dls.x}px`,
                '--startY': `${dls.y}px`
              })}
            />
          ))}
        </React.Fragment>
      ))}
    </div>
  );
};

export default DependencyLines;

function edgesToDependencyLines(edges: EdgeWithClass[], lineContainerRect: DOMRect): DependencyLine[] {
  return edges
    .map((edge): DependencyLine | null => {
      const fromElement = document.querySelector<HTMLElement>(`[data-file-path="${edge.from}"] span`);
      const toElement = document.querySelector<HTMLElement>(`[data-file-path="${edge.to}"] span`);

      if (!fromElement || !toElement) {
        console.warn(`Cannot find element from ${edge.from}`);
        return null;
      }

      const fromRect = fromElement.getBoundingClientRect();
      const toRect = toElement.getBoundingClientRect();

      const areWeGoingDown = fromRect.top < toRect.top;

      const leftStartPointPadding = 5;

      const from: Point = {
        x: leftStartPointPadding + fromRect.left - lineContainerRect.left + fromRect.width + 1,
        y: fromRect.top - lineContainerRect.top + (areWeGoingDown ? 15 : 7)
      };

      const to: Point = {
        x: leftStartPointPadding + toRect.left - lineContainerRect.left + toRect.width,
        y: toRect.top - lineContainerRect.top + (areWeGoingDown ? -1 : 7)
      };

      const tbbtHeight = Math.abs(from.y - to.y) - borderRadius;

      const widthPart = 240 + (tbbtHeight / lineContainerRect.height) * 680;
      const lrWidth = (to.x > from.x ? to.x - from.x : 0) + widthPart;
      const rwWidth = (to.x < from.x ? from.x - to.x : 0) + widthPart;

      return {
        fromPath: edge.from,
        toPath: edge.to,
        segmentOne: {
          ...from,
          type: areWeGoingDown ? 'down-LR' : 'up-LR',
          width: lrWidth,
          height: borderRadius,
          class: edge.class
        },
        segmentTwo: {
          x: from.x + lrWidth - borderRadius,
          y: areWeGoingDown ? from.y : to.y,
          type: areWeGoingDown ? 'down' : 'up',
          height: tbbtHeight + 20,
          width: borderRadius,
          class: edge.class
        },
        segmentThree: {
          ...to,
          type: areWeGoingDown ? 'down-RL' : 'up-RL',
          width: rwWidth,
          height: borderRadius,
          class: edge.class
        }
      };
    })
    .filter(Boolean) as NonNullable<DependencyLine[]>;
}

interface Point {
  x: number;
  y: number;
}

type LineSegmentTypes = 'down-LR' | 'down' | 'down-RL' | 'up-LR' | 'up' | 'up-RL';

interface DependencyLineSegment {
  type: LineSegmentTypes;
  x: number;
  y: number;
  width: number;
  height: number;
  class: EdgeClass;
}

interface DependencyLine {
  fromPath: string;
  toPath: string;
  segmentOne: DependencyLineSegment;
  segmentTwo: DependencyLineSegment;
  segmentThree: DependencyLineSegment;
}
