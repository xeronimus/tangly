import {DependencyGraph} from '../types';
import {getGraphStats} from '../graph';

/**
 * Normalize path to use forward slashes for cross-platform consistency
 */
function normalizePath(filePath: string): string {
  return filePath.replace(/\\/g, '/');
}

interface JsonOutput {
  metadata: {
    rootDir: string;
    totalFiles: number;
    totalEdges: number;
    averageDependencies: number;
    maxDependencies: number;
    filesWithNoDependencies: number;
    filesWithNoDependents: number;
    circularDependencies: string[][];
  };
  nodes: Array<{
    path: string;
    relativePath: string;
    dependencies: string[];
    dependents: string[];
  }>;
  edges: Array<{
    from: string;
    to: string;
    imports: Array<{
      names: string[];
      type: string;
      isTypeOnly: boolean;
    }>;
  }>;
}

/**
 * Format dependency graph as JSON
 */
export function formatAsJson(graph: DependencyGraph): string {
  const stats = getGraphStats(graph);

  const output: JsonOutput = {
    metadata: {
      rootDir: normalizePath(graph.rootDir),
      totalFiles: stats.totalFiles,
      totalEdges: stats.totalEdges,
      averageDependencies: stats.averageDependencies,
      maxDependencies: stats.maxDependencies,
      filesWithNoDependencies: stats.filesWithNoDependencies,
      filesWithNoDependents: stats.filesWithNoDependents,
      circularDependencies: stats.circularDependencies.map((cycle) =>
        cycle.map((filePath) => normalizePath(filePath))
      )
    },
    nodes: Array.from(graph.nodes.values()).map((node) => ({
      path: normalizePath(node.path),
      relativePath: normalizePath(node.relativePath),
      dependencies: node.dependencies.map((dep) => normalizePath(dep)),
      dependents: node.dependents.map((dep) => normalizePath(dep))
    })),
    edges: graph.edges.map((edge) => ({
      from: normalizePath(edge.from),
      to: normalizePath(edge.to),
      imports: edge.imports.map((imp) => ({
        names: imp.names,
        type: imp.type,
        isTypeOnly: imp.isTypeOnly
      }))
    }))
  };

  return JSON.stringify(output, null, 2);
}
