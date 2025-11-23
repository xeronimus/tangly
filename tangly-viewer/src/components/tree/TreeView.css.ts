import {globalStyle, style} from '@vanilla-extract/css';

export const treeItem = style({
  fontSize: 14,
  margin: '3px 0',
  padding: '2px 0',
  borderRadius: 5,
  listStyleType: 'none'
});

globalStyle(`${treeItem} > span `, {
  padding: 4
});

export const treeWrapper = style({
  position: 'relative',
  zIndex: 1
});

export const tree = style({
  listStyle: 'none',
  paddingLeft: 0,
  margin: 0,
  background: '#2b2b2b',
  color: '#dedede'
});
