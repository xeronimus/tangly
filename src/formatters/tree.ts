import {ProjectGraph} from '../types';
import {getGraphStats} from '../graph';

/**
 * Normalize path to use forward slashes for cross-platform consistency
 */
function normalizePath(filePath: string): string {
  return filePath.replace(/\\/g, '/');
}

/**
 * Format project graph as a tree view for console output
 */
export function formatAsTree(graph: ProjectGraph): string {
  const lines: string[] = [];
  const stats = getGraphStats(graph);

  // Header
  lines.push('='.repeat(80));
  lines.push(`Dependency Graph for: ${normalizePath(graph.rootDir)}`);
  lines.push('='.repeat(80));
  lines.push('');

  // Statistics
  lines.push('📊 Statistics:');
  lines.push(`  Total files: ${stats.totalFiles}`);
  lines.push(`  Total dependencies: ${stats.totalEdges}`);
  lines.push(`  Average dependencies per file: ${stats.averageDependencies.toFixed(2)}`);
  lines.push(`  Max dependencies: ${stats.maxDependencies}`);
  lines.push(`  Files with no dependencies: ${stats.filesWithNoDependencies}`);
  lines.push(`  Files with no dependents: ${stats.filesWithNoDependents}`);

  if (stats.circularDependencies.length > 0) {
    lines.push('');
    lines.push(`  WARNING: ${stats.circularDependencies.length} circular dependencies detected!`);
  } else {
    lines.push('');
    lines.push(`  ✅: No circular dependencies detected!`);
  }

  lines.push('');
  lines.push('-'.repeat(80));
  lines.push('');

  // Show circular dependencies if any
  if (stats.circularDependencies.length > 0) {
    lines.push(`Circular Dependencies: ${stats.circularDependencies.length}`);
    for (let i = 0; i < stats.circularDependencies.length; i++) {
      const cycle = stats.circularDependencies[i];
      lines.push(`  ${i + 1}. Cycle of ${cycle.length - 1} files:`);
      for (let j = 0; j < cycle.length; j++) {
        const node = graph.nodes.get(cycle[j]);
        const prefix = j === cycle.length - 1 ? '     └─>' : '     ├─>';
        lines.push(`${prefix} ${normalizePath(node?.relativePath || cycle[j])}`);
      }
    }
    lines.push('');
    lines.push('-'.repeat(80));
    lines.push('');
  }

  // Group files by their role
  const rootFiles: string[] = [];
  const leafFiles: string[] = [];
  const intermediateFiles: string[] = [];
  const isolatedFiles: string[] = [];

  for (const [filePath, node] of graph.nodes.entries()) {
    if (node.dependencies.length === 0 && node.dependents.length === 0) {
      isolatedFiles.push(filePath);
    } else if (node.dependents.length === 0 && node.dependencies.length > 0) {
      rootFiles.push(filePath);
    } else if (node.dependencies.length === 0 && node.dependents.length > 0) {
      leafFiles.push(filePath);
    } else {
      intermediateFiles.push(filePath);
    }
  }

  // Display root files (entry points)
  if (rootFiles.length > 0) {
    lines.push(`Entry Points (files with no dependents): ${rootFiles.length}`);
    for (const filePath of rootFiles) {
      const node = graph.nodes.get(filePath)!;
      lines.push(`  ${normalizePath(node.relativePath)} (${node.dependencies.length} dependencies)`);
      printDependencyTree(graph, filePath, lines, '    ', new Set(), 7);
      lines.push('');
    }
    lines.push('-'.repeat(80));
    lines.push('');
  }

  // Display leaf files
  if (leafFiles.length > 0) {
    lines.push('Leaf Files (files with no dependencies):');
    for (const filePath of leafFiles) {
      const node = graph.nodes.get(filePath)!;
      lines.push(`  ${normalizePath(node.relativePath)} (${node.dependents.length} dependents)`);
    }
    lines.push('');
    lines.push('-'.repeat(80));
    lines.push('');
  }

  // Display isolated files
  if (isolatedFiles.length > 0) {
    lines.push('Isolated Files (no dependencies or dependents):');
    for (const filePath of isolatedFiles) {
      const node = graph.nodes.get(filePath)!;
      lines.push(`  ${normalizePath(node.relativePath)}`);
    }
    lines.push('');
  }

  return lines.join('\n');
}

/**
 * Print dependency tree recursively
 */
function printDependencyTree(
  graph: ProjectGraph,
  filePath: string,
  lines: string[],
  prefix: string,
  visited: Set<string>,
  maxDepth: number = 3,
  currentDepth: number = 0
): void {
  if (currentDepth >= maxDepth) {
    lines.push(`${prefix}... (max depth reached)`);
    return;
  }

  if (visited.has(filePath)) {
    return;
  }

  visited.add(filePath);

  const node = graph.nodes.get(filePath);
  if (!node) return;

  for (let i = 0; i < node.dependencies.length; i++) {
    const depPath = node.dependencies[i];
    const depNode = graph.nodes.get(depPath);
    if (!depNode) continue;

    const isLast = i === node.dependencies.length - 1;
    const connector = isLast ? '└──' : '├──';
    const nextPrefix = prefix + (isLast ? '    ' : '│   ');

    // Get import details
    const edge = graph.importEdges.find((e) => e.from === filePath && e.to === depPath);
    const importInfo = edge ? formatImportInfo(edge.imports) : '';

    lines.push(`${prefix}${connector} ${normalizePath(depNode.relativePath)}${importInfo}`);

    if (!visited.has(depPath)) {
      printDependencyTree(graph, depPath, lines, nextPrefix, visited, maxDepth, currentDepth + 1);
    } else {
      lines.push(`${nextPrefix}... (already shown)`);
    }
  }
}

/**
 * Format import information for display
 */
function formatImportInfo(imports: Array<{names: string[]; type: string; isTypeOnly: boolean}>): string {
  if (imports.length === 0) return '';

  const parts: string[] = [];
  for (const imp of imports) {
    if (imp.type === 'side-effect') {
      parts.push('side-effect');
    } else if (imp.names.length > 0) {
      const typePrefix = imp.isTypeOnly ? 'type ' : '';
      const names = imp.names.length > 3 ? `${imp.names.slice(0, 3).join(', ')}...` : imp.names.join(', ');
      parts.push(`${typePrefix}{${names}}`);
    }
  }

  return parts.length > 0 ? ` [${parts.join(', ')}]` : '';
}
