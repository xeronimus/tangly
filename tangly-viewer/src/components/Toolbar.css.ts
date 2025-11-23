import {style} from '@vanilla-extract/css';

export const toolbar = style({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'flex-start',
  alignItems: 'center',

  paddingBottom: 6,
  marginBottom: 16,

  borderRadius: 2,
  borderBottom: '1px solid rgba(100,100,100,0.8)'
});

export const toolbarIcon = style({
  cursor: 'pointer',
  display: 'flex-inline',
  alignItems: 'center',
  justifyContent: 'center',
  paddingTop: 2,
  ':hover': {
    backgroundColor: 'rgba(100,100,100,0.8)'
  }
});

export const selectedPath = style({
  fontSize: 12,
  marginLeft: 24,
  fontStyle: 'italic'
});
