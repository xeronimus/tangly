import {ProjectGraph} from '../types';
import * as path from 'path';

/**
 * Format project graph as hierarchical DOT (Graphviz) format
 * Files are positioned according to their directory structure
 */
export function formatAsDotHierarchy(graph: ProjectGraph): string {
  const lines: string[] = [];

  lines.push('digraph ProjectGraph {');
  lines.push('  rankdir=TB;');
  lines.push('  compound=true;');
  lines.push('  node [shape=box, style=rounded];');
  lines.push('');

  // Create a map of file paths to node IDs
  const nodeIds = new Map<string, string>();

  // Group files by their parent directory
  const dirToFiles = new Map<string, string[]>();
  for (const node of graph.nodes.values()) {
    const parentDir = node.parent || graph.rootDir;
    if (!dirToFiles.has(parentDir)) {
      dirToFiles.set(parentDir, []);
    }
    dirToFiles.get(parentDir)!.push(node.path);
  }

  // Build a tree of directories
  const allDirs = new Set(dirToFiles.keys());
  const dirTree = buildDirectoryTree(Array.from(allDirs), graph.rootDir);

  // Generate clusters recursively
  generateClusters(dirTree, graph, nodeIds, lines, 0);

  lines.push('');

  // Add import edges
  for (const edge of graph.importEdges) {
    const fromId = nodeIds.get(edge.from);
    const toId = nodeIds.get(edge.to);

    if (!fromId || !toId) continue;

    // Create edge label with import details
    const importLabels: string[] = [];
    for (const imp of edge.imports) {
      if (imp.type === 'side-effect') {
        importLabels.push('side-effect');
      } else if (imp.names.length > 0) {
        const names = imp.names.length > 3 ? `${imp.names.slice(0, 3).join(', ')}...` : imp.names.join(', ');
        const typePrefix = imp.isTypeOnly ? 'type ' : '';
        importLabels.push(`${typePrefix}{${names}}`);
      }
    }

    const label = importLabels.length > 0 ? importLabels.join('\\n') : '';
    const color = edge.imports.some((imp) => imp.isTypeOnly) ? 'blue' : 'black';
    const style = edge.imports.some((imp) => imp.type === 'side-effect') ? 'dashed' : 'solid';

    lines.push(`  ${fromId} -> ${toId} [label="${escapeLabel(label)}", color="${color}", style="${style}"];`);
  }

  lines.push('}');

  return lines.join('\n');
}

interface DirNode {
  path: string;
  name: string;
  children: DirNode[];
  files: string[];
}

/**
 * Build a tree structure of directories
 */
function buildDirectoryTree(dirPaths: string[], rootDir: string): DirNode {
  const root: DirNode = {
    path: rootDir,
    name: path.basename(rootDir) || 'root',
    children: [],
    files: []
  };

  const nodeMap = new Map<string, DirNode>();
  nodeMap.set(rootDir, root);

  // Sort directories by depth to ensure parents are created before children
  const sortedDirs = dirPaths.sort((a, b) => {
    const depthA = a.split(path.sep).length;
    const depthB = b.split(path.sep).length;
    return depthA - depthB;
  });

  for (const dirPath of sortedDirs) {
    if (dirPath === rootDir) continue;

    const parentPath = path.dirname(dirPath);
    const parentNode = nodeMap.get(parentPath);

    if (parentNode) {
      const node: DirNode = {
        path: dirPath,
        name: path.basename(dirPath),
        children: [],
        files: []
      };
      parentNode.children.push(node);
      nodeMap.set(dirPath, node);
    }
  }

  return root;
}

/**
 * Generate DOT clusters recursively
 */
function generateClusters(
  dirNode: DirNode,
  graph: ProjectGraph,
  nodeIds: Map<string, string>,
  lines: string[],
  depth: number
): void {
  const indent = '  '.repeat(depth + 1);
  const clusterName = `cluster_${dirNode.path.replace(/[^a-zA-Z0-9]/g, '_')}`;

  // Start cluster
  lines.push(`${indent}subgraph ${clusterName} {`);
  lines.push(`${indent}  label="${normalizePath(path.relative(graph.rootDir, dirNode.path)) || '.'}";`);
  lines.push(`${indent}  style=filled;`);
  lines.push(`${indent}  color=${depth === 0 ? 'lightgrey' : 'white'};`);
  lines.push(`${indent}  fillcolor="${depth === 0 ? '#f0f0f0' : '#ffffff'}";`);
  lines.push('');

  // Add files in this directory
  const filesInDir = Array.from(graph.nodes.values()).filter((node) => (node.parent || graph.rootDir) === dirNode.path);

  for (const fileNode of filesInDir) {
    const nodeId = `n${nodeIds.size}`;
    nodeIds.set(fileNode.path, nodeId);

    const fileName = path.basename(fileNode.path);

    // Color nodes based on their role
    let fillcolor = 'lightblue';
    if (fileNode.dependencies.length === 0 && fileNode.dependents.length > 0) {
      fillcolor = 'lightgreen'; // Leaf nodes
    } else if (fileNode.dependents.length === 0 && fileNode.dependencies.length > 0) {
      fillcolor = 'lightyellow'; // Entry points
    } else if (fileNode.dependencies.length === 0 && fileNode.dependents.length === 0) {
      fillcolor = 'lightgray'; // Isolated
    }

    lines.push(
      `${indent}  ${nodeId} [label="${escapeLabel(fileName)}", fillcolor="${fillcolor}", style="filled,rounded"];`
    );
  }

  // Add child directories (nested clusters)
  for (const child of dirNode.children) {
    generateClusters(child, graph, nodeIds, lines, depth + 1);
  }

  lines.push(`${indent}}`);
}

/**
 * Normalize path to use forward slashes
 */
function normalizePath(filePath: string): string {
  return filePath.replace(/\\/g, '/');
}

/**
 * Escape special characters for DOT labels
 */
function escapeLabel(label: string): string {
  return label.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n');
}
