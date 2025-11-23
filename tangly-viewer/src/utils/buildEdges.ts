import {EdgeWithClass} from '../types.ts';
import {ImportEdge} from '../importedTypes.ts';

export default function buildEdges(importEdges: ImportEdge[], rootDir: string): EdgeWithClass[] {
  return importEdges.map((edge) => {
    const isTypeOnly = edge.imports.some((imp) => imp.isTypeOnly);
    const isSideEffect = edge.imports.some((imp) => imp.type === 'side-effect');

    let edgeClass: EdgeWithClass['class'] = 'import-regular';
    if (isSideEffect) {
      edgeClass = 'import-side-effect';
    } else if (isTypeOnly) {
      edgeClass = 'import-type';
    }

    return {
      from: edge.from.replace(rootDir, ''),
      to: edge.to.replace(rootDir, ''),
      class: edgeClass
    };
  });
}
