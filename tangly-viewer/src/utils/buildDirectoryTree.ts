import {DirNode, FileNode} from '../types';

/**
 * Build a tree structure of directories from file nodes
 */
export function buildDirectoryTree(fileNodes: FileNode[], rootDir: string): DirNode {
  const root: DirNode = {
    path: rootDir,
    name: rootDir.split('/').pop() || 'root',
    children: [],
    files: []
  };

  const nodeMap = new Map<string, DirNode>();
  nodeMap.set(rootDir, root);

  // Collect all unique directory paths
  const dirPaths = new Set<string>();
  for (const file of fileNodes) {
    const parentPath = file.parent || rootDir;
    if (parentPath !== rootDir) {
      dirPaths.add(parentPath);
    }
  }

  // Sort directories by depth to ensure parents are created before children
  const sortedDirs = Array.from(dirPaths).sort((a, b) => {
    const depthA = a.split('/').length;
    const depthB = b.split('/').length;
    return depthA - depthB;
  });

  // Create directory nodes
  for (const dirPath of sortedDirs) {
    const parentPath = dirPath.split('/').slice(0, -1).join('/') || rootDir;
    const parentNode = nodeMap.get(parentPath);

    if (parentNode) {
      const node: DirNode = {
        path: dirPath,
        name: dirPath.split('/').pop() || dirPath,
        children: [],
        files: []
      };
      parentNode.children.push(node);
      nodeMap.set(dirPath, node);
    }
  }

  // Assign files to their parent directories
  for (const file of fileNodes) {
    const parentPath = file.parent || rootDir;
    const parentNode = nodeMap.get(parentPath);
    if (parentNode) {
      parentNode.files.push(file);
    }
  }

  return root;
}
