import {globalStyle, style} from '@vanilla-extract/css';
import {treeItem} from './TreeView.css';

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
  backgroundColor: '#2e436e',
  borderRadius: 5
});

export const leafFile = style({});

export const entryPoint = style({});
