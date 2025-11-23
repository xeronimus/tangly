import {GraphNode} from '../importedTypes';
import {DirectoryNodeData} from '../types.ts';

/**
 * Build a tree structure of directories from file nodes
 */
export function buildDirectoryTree(nodes: GraphNode[], rootDir: string): DirectoryNodeData {
  const root: DirectoryNodeData = {
    relativePath: '/',
    absolutePath: rootDir,
    name: rootDir.split('/').pop() || 'root',
    childDirectories: [],
    files: []
  };

  const nodeMap = new Map<string, DirectoryNodeData>();
  nodeMap.set(rootDir, root);

  // Collect all unique directory paths
  const dirPaths = new Set<string>();
  for (const file of nodes) {
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
      const node: DirectoryNodeData = {
        relativePath: dirPath.replace(rootDir, ''),
        absolutePath: dirPath,
        name: dirPath.split('/').pop() || dirPath,
        childDirectories: [],
        files: []
      };
      parentNode.childDirectories.push(node);
      nodeMap.set(dirPath, node);
    }
  }

  // Assign files to their parent directories
  for (const file of nodes) {
    const parentPath = file.parent || rootDir;
    const parentNode = nodeMap.get(parentPath);
    if (parentNode) {
      parentNode.files.push({
        relativePath: '/' + file.relativePath,
        absolutePath: file.path,
        name: file.relativePath.split('/').pop() || file.relativePath,
        dependencies: file.dependencies,
        dependents: file.dependents
      });
    }
  }

  return root;
}
