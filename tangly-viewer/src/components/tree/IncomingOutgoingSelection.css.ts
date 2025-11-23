import {globalStyle, style} from '@vanilla-extract/css';

export const treeItemToggles = style({
  fontSize: 12,
  backgroundColor: 'white',
  padding: '1px 0',
  borderRadius: 4,
  color: 'black',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center'
});

globalStyle(`${treeItemToggles} svg`, {
  display: ' block'
});
