import {ProjectGraph} from '../types';
import * as path from 'path';

/**
 * Format project graph as hierarchical DOT (Graphviz) format using invisible point nodes
 * Creates a clean tree structure showing file hierarchy with import dependencies overlaid
 */
export function formatAsDotHierarchy(graph: ProjectGraph): string {
  const lines: string[] = [];

  lines.push('digraph ProjectGraph {');
  lines.push('  rankdir=LR;');
  lines.push('  ranksep=1;');
  lines.push('  nodesep=0.5;');
  lines.push('  node [shape=box, style=rounded];');
  lines.push('');

  // Create a map of file paths to node IDs
  const nodeIds = new Map<string, string>();
  let nodeCounter = 0;
  let dotCounter = 0;

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

  // Generate file nodes (all at once, so they can be referenced)
  for (const node of graph.nodes.values()) {
    const nodeId = `n${nodeCounter++}`;
    nodeIds.set(node.path, nodeId);

    const fileName = path.basename(node.path);

    // Color nodes based on their role
    let fillcolor = 'lightblue';
    if (node.dependencies.length === 0 && node.dependents.length > 0) {
      fillcolor = 'lightgreen'; // Leaf nodes
    } else if (node.dependents.length === 0 && node.dependencies.length > 0) {
      fillcolor = 'lightyellow'; // Entry points
    } else if (node.dependencies.length === 0 && node.dependents.length === 0) {
      fillcolor = 'lightgray'; // Isolated
    }

    lines.push(`  ${nodeId} [label="${escapeLabel(fileName)}", fillcolor="${fillcolor}", style="filled,rounded"];`);
  }

  lines.push('');

  // Generate directory hierarchy using invisible point nodes
  function generateHierarchy(dirNode: DirNode, parentDotId?: string): void {
    const filesInDir = Array.from(graph.nodes.values()).filter(
      (node) => (node.parent || graph.rootDir) === dirNode.path
    );
    const children = [
      ...filesInDir.map((f) => ({type: 'file' as const, node: f})),
      ...dirNode.children.map((d) => ({type: 'dir' as const, node: d}))
    ];

    if (children.length === 0) return;

    // Create directory label node (optional, using invisible point for now)
    const dirLabelId = `dir_${dirNode.path.replace(/[^a-zA-Z0-9]/g, '_')}`;
    const dirLabel = normalizePath(path.relative(graph.rootDir, dirNode.path)) || '.';

    // For root or when we have a parent connection, create a visible directory node
    if (dirNode.path === graph.rootDir || parentDotId) {
      lines.push(
        `  ${dirLabelId} [label="${escapeLabel(dirLabel)}/", shape=folder, fillcolor="#f0f0f0", style="filled"];`
      );
    }

    // Create invisible dot nodes for branching (one per child)
    const dotIds: string[] = [];
    for (let i = 0; i < children.length; i++) {
      const dotId = `dot${dotCounter++}`;
      dotIds.push(dotId);
      lines.push(`  ${dotId} [shape=point, width=0];`);
    }

    // Group dots at same rank
    if (dotIds.length > 0) {
      lines.push(`  {rank=same; ${dirLabelId}; ${dotIds.join('; ')}}`);

      // Connect directory label to dots horizontally (no arrows)
      const dotChain = [dirLabelId, ...dotIds].join(' -> ');
      lines.push(`  ${dotChain} [arrowhead=none];`);
    }

    // Connect dots to children (files or subdirectories)
    children.forEach((child, i) => {
      const dotId = dotIds[i];

      if (child.type === 'file') {
        const fileNodeId = nodeIds.get(child.node.path);
        if (fileNodeId) {
          lines.push(`  ${dotId} -> ${fileNodeId} [weight=20, arrowhead=none];`);
        }
      } else {
        // Recurse into subdirectory
        generateHierarchy(child.node, dotId);
      }
    });

    // Connect parent dot to this directory label
    if (parentDotId) {
      lines.push(`  ${parentDotId} -> ${dirLabelId} [weight=20, arrowhead=none];`);
    }

    lines.push('');
  }

  // Generate the hierarchy starting from root
  generateHierarchy(dirTree);

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
    const color = edge.imports.some((imp) => imp.isTypeOnly) ? 'blue' : 'red';
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
