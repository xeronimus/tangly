import {style, globalStyle} from '@vanilla-extract/css';

globalStyle('body', {
  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', sans-serif",
  margin: 0,
  padding: '20px',
  background: '#f5f5f5',
  color: '#333'
});

export const title = style({
  color: '#1976d2',
  marginBottom: '20px'
});

export const container = style({
  position: 'relative',
  background: 'white',
  padding: '30px',
  borderRadius: '8px',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  minHeight: '400px'
});

export const dependencySvg = style({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  pointerEvents: 'none',
  zIndex: 10
});

export const treeWrapper = style({
  position: 'relative',
  zIndex: 1,
  pointerEvents: 'none'
});

export const tree = style({
  listStyle: 'none',
  paddingLeft: 0,
  margin: 0
});

globalStyle(`${tree} ol`, {
  listStyle: 'none',
  paddingLeft: '24px',
  margin: '2px 0'
});

globalStyle(`${tree} li`, {
  margin: '2px 0',
  padding: '6px 10px',
  borderRadius: '4px',
  transition: 'background 0.2s',
  position: 'relative',
  pointerEvents: 'auto'
});

export const fileItem = style({
  color: '#1976d2',
  fontFamily: "'Consolas', 'Monaco', monospace",
  fontSize: '14px',
  selectors: {
    '&::before': {
      content: '📄 ',
      marginRight: '4px'
    }
  }
});

export const directoryItem = style({
  fontWeight: 600,
  color: '#424242',
  marginTop: '8px',
  border: '2px solid transparent',
  cursor: 'pointer',
  selectors: {
    '&::before': {
      content: '📁 ',
      marginRight: '4px'
    }
  }
});

export const selectedDirectory = style({
  fontWeight: 'bold',
  border: '2px solid #ccc',
  selectors: {
    '&::before': {
      content: '--> 📂 '
    }
  }
});

export const entryPoint = style({});

export const leafFile = style({});

export const dependencyLine = style({
  transition: 'opacity 0.2s, stroke-width 0.2s',
  selectors: {
    '&:hover': {
      opacity: '1 !important',
      strokeWidth: '3 !important'
    }
  }
});

export const legend = style({
  marginTop: '20px',
  padding: '15px',
  background: '#f5f5f5',
  borderRadius: '4px'
});

export const legendTitle = style({
  marginTop: 0,
  fontSize: '16px'
});

export const legendItem = style({
  display: 'inline-block',
  marginRight: '20px',
  fontSize: '14px'
});

export const legendLine = style({
  display: 'inline-block',
  width: '30px',
  height: '2px',
  marginRight: '5px',
  verticalAlign: 'middle'
});

export const legendLineRegular = style({
  background: 'linear-gradient(to right, #e91e63, #00bcd4)'
});

export const legendLineType = style({
  background: 'linear-gradient(to right, #9c27b0, #00e676)'
});

export const legendLineSideEffect = style({
  background: 'linear-gradient(to right, #ff6f00 50%, transparent 50%)',
  backgroundSize: '10px 2px'
});

export const stats = style({
  marginTop: '20px',
  padding: '15px',
  background: '#f5f5f5',
  borderRadius: '4px'
});

export const statsTitle = style({
  marginTop: 0,
  fontSize: '16px'
});

export const statsGrid = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
  gap: '10px'
});

export const statItem = style({
  fontSize: '14px'
});

export const statLabel = style({
  fontWeight: 600,
  color: '#666'
});
