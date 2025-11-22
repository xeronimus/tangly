import {CSSProperties} from 'react';

export default function asCSSProperties(css: object): CSSProperties {
  return css as CSSProperties;
}
