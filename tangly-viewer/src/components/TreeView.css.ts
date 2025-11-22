import {globalStyle, style} from '@vanilla-extract/css';

// the <ol> elements use this class
export const treeNodeList = style({
  margin: '0 20px',
  padding: 0
});

const treeItem = style({
  fontSize: 14,
  margin: '3px 0',
  padding: '2px 0',
  borderRadius: 5,
  listStyleType: 'none'
});

export const directoryItem = style([
  treeItem,
  {
    cursor: 'pointer',
    selectors: {
      '&::before': {
        content: '📁',
        marginRight: 1
      }
    }
  }
]);

export const directoryItemSelected = style({});

globalStyle(`${directoryItemSelected} > span `, {
  backgroundColor: '#2e436e'
});

export const fileItem = style([
  treeItem,
  {
    selectors: {
      '&::before': {
        content: '📄',
        marginRight: 1
      }
    }
  }
]);

export const fileItemSelected = style({});

globalStyle(`${fileItemSelected} > span `, {
  backgroundColor: '#2e436e'
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

export const leafFile = style({});

export const entryPoint = style({});
