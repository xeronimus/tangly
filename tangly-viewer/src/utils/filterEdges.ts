import {ImportEdge, TreeSelection} from '../types.ts';

export function filterEdges(importEdges: ImportEdge[], selectedNode: TreeSelection | null): ImportEdge[] {
  if (!selectedNode) {
    return [...importEdges];
  }

  if (selectedNode.isDirectory) {
    return importEdges.filter((edge) => {
      const edgeFromDir = edge.from.substring(0, edge.from.lastIndexOf('/'));
      const edgeToDir = edge.to.substring(0, edge.to.lastIndexOf('/'));
      return edgeFromDir === selectedNode.nodePath || edgeToDir === selectedNode.nodePath;
    });
  } else {
    return importEdges.filter((edge) => {
      return edge.from === selectedNode.nodePath || edge.to === selectedNode.nodePath;
    });
  }
}
