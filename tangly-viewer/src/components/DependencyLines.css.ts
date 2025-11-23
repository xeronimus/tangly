import {globalStyle, style, styleVariants} from '@vanilla-extract/css';

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
  pointerEvents: 'auto'
});

const downLRShadow = '0px -3px 2px 0px rgba(255,255,255,0.4)';
const downRLShadow = '0px 3px 2px 0px rgba(255,255,255,0.4)';
const verticalShadow = '3px 0px 3px 0px rgba(255,255,255,0.4)';

const upLRShadow = '0px 3px 2px 0px rgba(255,255,255,0.4)';
const upRLShadow = '0px -3px 2px 0px rgba(255,255,255,0.4)';

export const lineBoxVariants = styleVariants({
  /* -- "down"  (start tree node is higher than end tree node) -- */

  'down-LR': [
    lineBoxBase,
    {
      borderTop: '2px solid transparent',
      borderImage: `linear-gradient(45deg, ${startColor}, ${cornerOneColor}) 1`,

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
        },
        '&:hover': {
          boxShadow: downLRShadow
        }
      }
    }
  ],

  down: [
    lineBoxBase,
    {
      borderRight: '2px solid transparent',
      borderImage: `linear-gradient(45deg, ${cornerOneColor}, ${cornerTwoColor}) 1`,

      selectors: {
        '&:hover': {
          boxShadow: verticalShadow
        }
      }
    }
  ],

  'down-RL': [
    lineBoxBase,
    {
      borderBottom: '2px solid transparent',
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
        },

        '&:hover': {
          boxShadow: downRLShadow
        }
      }
    }
  ],

  /* -- "up"  (start tree node is lower than end tree node) -- */

  'up-LR': [
    lineBoxBase,
    {
      borderBottom: '2px solid transparent',
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
        },

        '&:hover': {
          boxShadow: upLRShadow
        }
      }
    }
  ],

  up: [
    lineBoxBase,
    {
      borderRight: '2px solid transparent',
      borderImage: `linear-gradient(45deg, ${cornerOneColor}, ${cornerTwoColor}) 1`,

      selectors: {
        '&:hover': {
          boxShadow: verticalShadow
        }
      }
    }
  ],

  'up-RL': [
    lineBoxBase,
    {
      borderTop: '2px solid transparent',
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
        },

        '&:hover': {
          boxShadow: upRLShadow
        }
      }
    }
  ]
});

// each line consists of three separate segment-divs. no parent element that could do the "line hovering".
// with a bit of css magic, we can add box shadows to the adjacent siblings of the hovered segment

/* -- down --*/
// LR is hovered, add shadow to down
globalStyle(`${lineBoxVariants['down-LR']}:hover + ${lineBoxVariants['down']}`, {
  boxShadow: verticalShadow
});
// LR is hovered, add shadow to RL (3rd segment)
globalStyle(`${lineBoxVariants['down-LR']}:hover + ${lineBoxVariants['down']} + ${lineBoxVariants['down-RL']}`, {
  boxShadow: downRLShadow
});

// down is hovered, add shadow to LR (1st segment)
globalStyle(`${lineBoxVariants['down-LR']}:has( + ${lineBoxVariants['down']}:hover )`, {
  boxShadow: downLRShadow
});
// down is hovered, add shadow to RL (3rd segment)
globalStyle(`${lineBoxVariants['down']}:hover  + ${lineBoxVariants['down-RL']} `, {
  boxShadow: downRLShadow
});

// RL is hovered, add shadow to down
globalStyle(`${lineBoxVariants['down']}:has( + ${lineBoxVariants['down-RL']}:hover )`, {
  boxShadow: verticalShadow
});
// RL is hovered, add shadow to LR (1st segment)
globalStyle(
  `${lineBoxVariants['down-LR']}:has( + ${lineBoxVariants['down']} +  ${lineBoxVariants['down-RL']}:hover )`,
  {
    boxShadow: downLRShadow
  }
);

/* -- up --*/
// LR is hovered, add shadow to up
globalStyle(`${lineBoxVariants['up-LR']}:hover + ${lineBoxVariants['up']}`, {
  boxShadow: verticalShadow
});
// LR is hovered, add shadow to RL (3rd segment)
globalStyle(`${lineBoxVariants['up-LR']}:hover + ${lineBoxVariants['up']} + ${lineBoxVariants['up-RL']}`, {
  boxShadow: upRLShadow
});

// up is hovered, add shadow to LR (1st segment)
globalStyle(`${lineBoxVariants['up-LR']}:has( + ${lineBoxVariants['up']}:hover )`, {
  boxShadow: upLRShadow
});
// up is hovered, add shadow to RL (3rd segment)
globalStyle(`${lineBoxVariants['up']}:hover  + ${lineBoxVariants['up-RL']} `, {
  boxShadow: upRLShadow
});

// RL is hovered, add shadow to up
globalStyle(`${lineBoxVariants['up']}:has( + ${lineBoxVariants['up-RL']}:hover )`, {
  boxShadow: verticalShadow
});
// RL is hovered, add shadow to LR (1st segment)
globalStyle(`${lineBoxVariants['up-LR']}:has( + ${lineBoxVariants['up']} +  ${lineBoxVariants['up-RL']}:hover )`, {
  boxShadow: upLRShadow
});
