import {JsonOutput} from '../publicTypes';
import {ProjectGraph} from '../internalTypes';

/**
 * Normalize path to use forward slashes for cross-platform consistency
 */
function normalizePath(filePath: string): string {
  return filePath.replace(/\\/g, '/');
}

/**
 * Format project graph as JSON
 */
export function formatAsJson(graph: ProjectGraph): string {
  const output: JsonOutput = {
    metadata: {
      rootDir: normalizePath(graph.metadata.rootDir),
      totalFiles: graph.metadata.totalFiles,
      totalEdges: graph.metadata.totalEdges,
      averageDependencies: graph.metadata.averageDependencies,
      maxDependencies: graph.metadata.maxDependencies,
      filesWithNoDependencies: graph.metadata.filesWithNoDependencies,
      filesWithNoDependents: graph.metadata.filesWithNoDependents,
      circularDependencies: graph.metadata.circularDependencies.map((cycle) =>
        cycle.map((filePath) => normalizePath(filePath))
      )
    },
    nodes: Array.from(graph.nodes.values()).map((node) => ({
      path: normalizePath(node.path),
      relativePath: normalizePath(node.relativePath),
      dependencies: node.dependencies.map((dep) => normalizePath(dep)),
      dependents: node.dependents.map((dep) => normalizePath(dep)),
      parent: node.parent ? normalizePath(node.parent) : undefined
    })),
    importEdges: graph.importEdges.map((edge) => ({
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
