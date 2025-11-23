import {EdgeWithClass, TreeSelection} from '../types.ts';

export function filterEdges(importEdges: EdgeWithClass[], treeSelection: TreeSelection | null): EdgeWithClass[] {
  if (!treeSelection) {
    return [];
  }

  if (treeSelection.isDirectory) {
    return importEdges.filter((edge) => {
      // If edge.from/to is a directory, use it directly. Otherwise extract the directory from the file path.
      const edgeFromDir = getDirectoryPath(edge.from);
      const edgeToDir = getDirectoryPath(edge.to);

      return (
        (treeSelection.includeOutgoing &&
          (edgeFromDir === treeSelection.nodePath || edge.from === treeSelection.nodePath)) ||
        (treeSelection.includeIncoming && (edgeToDir === treeSelection.nodePath || edge.to === treeSelection.nodePath))
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

function getDirectoryPath(path: string): string {
  const lastSlashIndex = path.lastIndexOf('/');
  if (lastSlashIndex === -1) return path;
  return path.substring(0, lastSlashIndex);
}
