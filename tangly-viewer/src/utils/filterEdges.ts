import {EdgeWithClass, TreeSelection} from '../types.ts';

export function filterEdges(importEdges: EdgeWithClass[], treeSelection: TreeSelection | null): EdgeWithClass[] {
  if (!treeSelection) {
    return [];
  }

  if (treeSelection.isDirectory) {
    return importEdges.filter((edge) => {
      const edgeFromDir = edge.from.substring(0, edge.from.lastIndexOf('/'));
      const edgeToDir = edge.to.substring(0, edge.to.lastIndexOf('/'));

      return (
        (treeSelection.includeOutgoing && edgeFromDir === treeSelection.nodePath) ||
        (treeSelection.includeIncoming && edgeToDir === treeSelection.nodePath)
      );
    });
  } else {
    return importEdges.filter((edge) => {
      return (
        (treeSelection.includeOutgoing && edge.from === treeSelection.nodePath) ||
        (treeSelection.includeIncoming && edge.to === treeSelection.nodePath)
      );
    });
  }
}
