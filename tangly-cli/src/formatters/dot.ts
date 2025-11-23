import {ProjectGraph} from '../internalTypes';

/**
 * Format project graph as DOT (Graphviz) format
 */
export function formatAsDot(graph: ProjectGraph): string {
  const lines: string[] = [];

  lines.push('digraph ProjectGraph {');
  lines.push('  rankdir=LR;');
  lines.push('  node [shape=box, style=rounded];');
  lines.push('');

  // Create a map of file paths to node IDs
  const nodeIds = new Map<string, string>();
  let nodeCounter = 0;

  for (const node of graph.nodes.values()) {
    const nodeId = `n${nodeCounter++}`;
    nodeIds.set(node.path, nodeId);

    // Use relative path as label
    const label = node.relativePath.replace(/\\/g, '/');

    // Color nodes based on their role
    let color = 'lightblue';
    if (node.dependencies.length === 0 && node.dependents.length > 0) {
      // Leaf nodes (no dependencies, but has dependents)
      color = 'lightgreen';
    } else if (node.dependents.length === 0 && node.dependencies.length > 0) {
      // Root nodes (no dependents, but has dependencies)
      color = 'lightyellow';
    } else if (node.dependencies.length === 0 && node.dependents.length === 0) {
      // Isolated nodes
      color = 'lightgray';
    }

    lines.push(`  ${nodeId} [label="${escapeLabel(label)}", fillcolor="${color}", style="filled,rounded"];`);
  }

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
        const names = imp.names.join(', ');
        const typePrefix = imp.isTypeOnly ? 'type ' : '';
        importLabels.push(`${typePrefix}${imp.type}: ${names}`);
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

/**
 * Escape special characters for DOT labels
 */
function escapeLabel(label: string): string {
  return label.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n');
}
