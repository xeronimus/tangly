import {style, styleVariants} from '@vanilla-extract/css';

const startColor = '#9aff00';
const cornerOneColor = '#00ff6f';
const cornerTwoColor = '#00ffc4';
const endColor = '#00b2ff';

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
  /* -- "down"  (start tree node is higher than end tree node) -- */

  'down-LR': [
    lineBoxBase,
    {
      borderTop: '2px solid transparent',
      borderImage: `linear-gradient(45deg, ${startColor}, ${cornerOneColor}) 1`,
      // borderTopRightRadius: borderRadius,

      selectors: {
        // starting dot
        '&:before': {
          content: ' ',
          position: 'absolute',
          left: -1,
          top: -5,
          borderRadius: '50%',
          width: 8,
          height: 8,
          background: startColor
        }
      }
    }
  ],

  down: [
    lineBoxBase,
    {
      borderRight: `2px solid transparent`,
      borderImage: `linear-gradient(45deg, ${cornerOneColor}, ${cornerTwoColor}) 1`
      // borderTopRightRadius: borderRadius,
      // borderBottomRightRadius: borderRadius
    }
  ],

  'down-RL': [
    lineBoxBase,
    {
      borderBottom: `2px solid transparent`,
      // borderBottomRightRadius: borderRadius,
      borderImage: `linear-gradient(45deg, ${endColor}, ${cornerTwoColor}) 1`,

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
          borderRight: `10px solid ${endColor}`
        }
      }
    }
  ],

  /* -- "up"  (start tree node is lower than end tree node) -- */

  'up-LR': [
    lineBoxBase,
    {
      borderBottom: '2px solid transparent',
      // borderBottomRightRadius: borderRadius,
      borderImage: `linear-gradient(45deg, ${startColor}, ${cornerOneColor}) 1`,

      selectors: {
        // starting dot
        '&:before': {
          content: ' ',
          position: 'absolute',
          left: -1,
          top: borderRadius / 2 - 1,
          borderRadius: '50%',
          width: 8,
          height: 8,
          background: startColor
        }
      }
    }
  ],

  up: [
    lineBoxBase,
    {
      borderRight: `2px solid transparent`,
      // borderTopRightRadius: borderRadius,
      // borderBottomRightRadius: borderRadius
      borderImage: `linear-gradient(45deg, ${cornerOneColor}, ${cornerTwoColor}) 1`
    }
  ],

  'up-RL': [
    lineBoxBase,
    {
      borderTop: `2px solid transparent`,
      // borderTopRightRadius: borderRadius,
      borderImage: `linear-gradient(45deg, ${endColor}, ${cornerTwoColor}) 1`,

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
          borderRight: `10px solid ${endColor}`
        }
      }
    }
  ]
});
