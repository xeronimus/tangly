import {style, styleVariants} from '@vanilla-extract/css';

const endLineColor = '#00ffda';
const verticalLineColor = '#008cff';

export const borderRadius = 10;

export const dependencyLinesContainer = style({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  overflow: 'visible',
  zIndex: 100,
  pointerEvents: 'none'
});

export const lineBoxBase = style({
  position: 'absolute',
  left: 'var(--startX)',
  top: 'var(--startY)',
  // background: 'rgba(255,255,255,0.3)',
  boxSizing: 'border-box',
  cursor: 'pointer',
  pointerEvents: 'all'
});

export const lineBoxVariants = styleVariants({
  'down-LR': [
    lineBoxBase,
    {
      borderTop: '2px solid green',
      borderTopRightRadius: borderRadius,

      selectors: {
        // starting dot
        '&:before': {
          content: ' ',
          position: 'absolute',
          left: 0,
          top: -4,
          borderRadius: '50%',
          width: 8,
          height: 8,
          background: 'green'
        }
      }
    }
  ],
  'up-LR': [
    lineBoxBase,
    {
      borderBottom: '2px solid green',
      borderBottomRightRadius: borderRadius,

      selectors: {
        // starting dot
        '&:before': {
          content: ' ',
          position: 'absolute',
          left: 0,
          top: borderRadius / 2,
          borderRadius: '50%',
          width: 8,
          height: 8,
          background: 'green'
        }
      }
    }
  ],
  down: [
    lineBoxBase,
    {
      borderRight: `2px solid ${verticalLineColor}`,
      borderTopRightRadius: borderRadius,
      borderBottomRightRadius: borderRadius
    }
  ],
  up: [
    lineBoxBase,
    {
      borderRight: `2px solid ${verticalLineColor}`,
      borderTopRightRadius: borderRadius,
      borderBottomRightRadius: borderRadius
    }
  ],
  'up-RL': [
    lineBoxBase,
    {
      borderTop: `2px solid ${endLineColor}`,
      borderTopRightRadius: borderRadius,

      selectors: {
        // arrow head
        '&:after': {
          content: '',
          width: 0,
          height: 0,
          position: 'absolute',
          left: -2,
          top: -5,
          backgroundColor: 'transparent',
          borderTop: '4px solid transparent',
          borderBottom: '4px solid transparent',
          borderRight: `10px solid ${endLineColor}`
        }
      }
    }
  ],
  'down-RL': [
    lineBoxBase,
    {
      borderBottom: `2px solid ${endLineColor}`,
      borderBottomRightRadius: borderRadius,

      selectors: {
        // arrow head
        '&:after': {
          content: '',
          width: 0,
          height: 0,
          position: 'absolute',
          left: -2,
          top: 5,
          backgroundColor: 'transparent',
          borderTop: '4px solid transparent',
          borderBottom: '4px solid transparent',
          borderRight: `10px solid ${endLineColor}`
        }
      }
    }
  ]
});
