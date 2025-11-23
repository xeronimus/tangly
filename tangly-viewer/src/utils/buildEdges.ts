import {EdgeWithClass, DirectoryNodeData} from '../types.ts';
import {ImportEdge} from '../importedTypes.ts';

export default function buildEdges(
  importEdges: ImportEdge[],
  rootDir: string,
  tree: DirectoryNodeData
): EdgeWithClass[] {
  return importEdges
    .map((edge) => {
      const isTypeOnly = edge.imports.some((imp) => imp.isTypeOnly);
      const isSideEffect = edge.imports.some((imp) => imp.type === 'side-effect');

      let edgeClass: EdgeWithClass['class'] = 'import-regular';
      if (isSideEffect) {
        edgeClass = 'import-side-effect';
      } else if (isTypeOnly) {
        edgeClass = 'import-type';
      }

      let fromPath = edge.from.replace(rootDir, '');
      let toPath = edge.to.replace(rootDir, '');

      // Ensure paths start with /
      if (!fromPath.startsWith('/')) fromPath = '/' + fromPath;
      if (!toPath.startsWith('/')) toPath = '/' + toPath;

      const from = resolveToVisibleNode(fromPath, tree);
      const to = resolveToVisibleNode(toPath, tree);

      if (from === to) {
        return null;
      }

      return {
        from,
        to,
        class: edgeClass
      };
    })
    .filter(Boolean) as NonNullable<EdgeWithClass[]>;
}

/**
 * Given a file path, find the visible node it should connect to.
 * If the file is in a collapsed directory, return the collapsed directory path.
 * Otherwise, return the file path itself.
 */
function resolveToVisibleNode(filePath: string, tree: DirectoryNodeData): string {
  const pathParts = filePath.split('/').filter(Boolean);

  let currentNode = tree;

  for (let i = 0; i < pathParts.length - 1; i++) {
    const part = pathParts[i];
    const childDir = currentNode.childDirectories.find((d) => d.name === part);

    if (!childDir) break;

    if (childDir.collapsed) {
      // This directory is collapsed, so the edge should point to it
      return childDir.relativePath;
    }

    currentNode = childDir;
  }

  // No collapsed parent found, return the original file path
  return filePath;
}
