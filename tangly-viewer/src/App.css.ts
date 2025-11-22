import {style, globalStyle} from '@vanilla-extract/css';

globalStyle('body', {
  fontFamily: "'Inter', sans-serif",
  fontOpticalSizing: 'auto',
  fontWeight: 400,
  fontStyle: 'normal',

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
  padding: '30px',
  borderRadius: '8px',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  minHeight: '400px',
  background: '#2b2b2b',
  color: '#dedede'
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
