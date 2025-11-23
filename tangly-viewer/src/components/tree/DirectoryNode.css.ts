import {globalStyle, style} from '@vanilla-extract/css';
import {treeItem} from './TreeView.css';

// the <ol> elements use this class
export const treeNodeList = style({
  margin: '0 20px',
  padding: 0
});

export const directoryItem = style([
  treeItem,
  {
    cursor: 'pointer'
  }
]);

export const directoryItemSelected = style({});

globalStyle(`${directoryItemSelected} > span `, {
  backgroundColor: '#2e436e',
  borderRadius: 5
});
