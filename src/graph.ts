import {ProjectGraph, GraphNode, ImportEdge} from './types';
import {findTypeScriptFiles, getRelativePath} from './fileDiscovery';
import {parseImports} from './parser';
import * as path from 'path';

/**
 * Build a project graph from a project directory
 */
export function buildProjectGraph(
  rootDir: string,
  includeExternal: boolean = false,
  excludePatterns?: string[]
): ProjectGraph {
  const files = findTypeScriptFiles(rootDir, includeExternal, excludePatterns);
  const nodes = new Map<string, GraphNode>();
  const importEdges: ImportEdge[] = [];

  // Initialize nodes for all files
  for (const filePath of files) {
    const parentDir = path.dirname(filePath);
    nodes.set(filePath, {
      path: filePath,
      relativePath: getRelativePath(rootDir, filePath),
      dependencies: [],
      dependents: [],
      parent: parentDir
    });
  }

  // Parse imports and build edges
  for (const filePath of files) {
    const imports = parseImports(filePath);

    for (const importInfo of imports) {
      const {resolvedPath, details} = importInfo;

      // Skip external dependencies if not included
      if (!includeExternal && !resolvedPath) {
        continue;
      }

      // If we have a resolved path and it's in our node set, create an edge
      if (resolvedPath && nodes.has(resolvedPath)) {
        const fromNode = nodes.get(filePath)!;
        const toNode = nodes.get(resolvedPath)!;

        // Add to dependencies and dependents
        if (!fromNode.dependencies.includes(resolvedPath)) {
          fromNode.dependencies.push(resolvedPath);
        }
        if (!toNode.dependents.includes(filePath)) {
          toNode.dependents.push(filePath);
        }

        // Create or update import edge
        let edge = importEdges.find((e) => e.from === filePath && e.to === resolvedPath);
        if (!edge) {
          edge = {
            from: filePath,
            to: resolvedPath,
            imports: []
          };
          importEdges.push(edge);
        }
        edge.imports.push(details);
      } else if (includeExternal && !resolvedPath) {
        // For external dependencies, we might want to track them differently
        // For now, we'll just track that this file has external dependencies
        // This could be enhanced later
      }
    }
  }

  return {
    nodes,
    importEdges,
    rootDir
  };
}

/**
 * Get statistics about the project graph
 */
export function getGraphStats(graph: ProjectGraph): {
  totalFiles: number;
  totalEdges: number;
  averageDependencies: number;
  maxDependencies: number;
  filesWithNoDependencies: number;
  filesWithNoDependents: number;
  circularDependencies: string[][];
} {
  const totalFiles = graph.nodes.size;
  const totalEdges = graph.importEdges.length;

  let maxDependencies = 0;
  let filesWithNoDependencies = 0;
  let filesWithNoDependents = 0;
  let totalDependencies = 0;

  for (const node of graph.nodes.values()) {
    const depCount = node.dependencies.length;
    totalDependencies += depCount;

    if (depCount === 0) {
      filesWithNoDependencies++;
    }
    if (depCount > maxDependencies) {
      maxDependencies = depCount;
    }
    if (node.dependents.length === 0) {
      filesWithNoDependents++;
    }
  }

  const averageDependencies = totalFiles > 0 ? totalDependencies / totalFiles : 0;

  // Detect circular dependencies
  const circularDependencies = findCircularDependencies(graph);

  return {
    totalFiles,
    totalEdges,
    averageDependencies,
    maxDependencies,
    filesWithNoDependencies,
    filesWithNoDependents,
    circularDependencies
  };
}

/**
 * Find circular dependencies in the graph using DFS
 */
function findCircularDependencies(graph: ProjectGraph): string[][] {
  const cycles: string[][] = [];
  const visited = new Set<string>();
  const recursionStack = new Set<string>();
  const pathStack: string[] = [];

  function dfs(filePath: string): void {
    visited.add(filePath);
    recursionStack.add(filePath);
    pathStack.push(filePath);

    const node = graph.nodes.get(filePath);
    if (!node) return;

    for (const dep of node.dependencies) {
      if (!visited.has(dep)) {
        dfs(dep);
      } else if (recursionStack.has(dep)) {
        // Found a cycle
        const cycleStartIndex = pathStack.indexOf(dep);
        const cycle = pathStack.slice(cycleStartIndex);
        cycles.push([...cycle, dep]);
      }
    }

    pathStack.pop();
    recursionStack.delete(filePath);
  }

  for (const filePath of graph.nodes.keys()) {
    if (!visited.has(filePath)) {
      dfs(filePath);
    }
  }

  return cycles;
}
