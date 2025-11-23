export interface JsonOutput {
  metadata: ProjectGraphMetadata;
  nodes: GraphNode[]; // in the internal type "ProjectGraph", this is a map. in the output we want to have a flat array.
  importEdges: ImportEdge[];
}

export interface ProjectGraphMetadata {
  rootDir: string;
  totalFiles: number;
  totalEdges: number;
  averageDependencies: number;
  maxDependencies: number;
  filesWithNoDependencies: number;
  filesWithNoDependents: number;
  circularDependencies: string[][];
}

/**
 * Types for the tangly project graph analyzer
 */

export type ImportType = 'default' | 'named' | 'namespace' | 'type' | 'side-effect';

export interface ImportDetail {
  /** The name(s) being imported */
  names: string[];
  /** Type of import */
  type: ImportType;
  /** Whether this is a type-only import */
  isTypeOnly: boolean;
}

export interface ImportEdge {
  /** Source file (the file doing the importing) */
  from: string;
  /** Target file (the file being imported) */
  to: string;
  /** Details about the imports */
  imports: ImportDetail[];
}

export interface GraphNode {
  /** Absolute path to the file */
  path: string;
  /** Relative path from project root */
  relativePath: string;
  /** Files this node imports (outgoing edges) */
  dependencies: string[];
  /** Files that import this node (incoming edges) */
  dependents: string[];
  /** Parent directory path */
  parent?: string;
}
