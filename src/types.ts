/**
 * Types for the spidernet dependency graph analyzer
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

export interface DependencyEdge {
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
}

export interface DependencyGraph {
  /** Map of file path to graph node */
  nodes: Map<string, GraphNode>;
  /** List of all dependency edges with import details */
  edges: DependencyEdge[];
  /** Root directory of the analyzed project */
  rootDir: string;
}

export type OutputFormat = 'json' | 'dot' | 'tree';

export interface AnalyzerOptions {
  /** Root directory to analyze */
  rootDir: string;
  /** Output format */
  format: OutputFormat;
  /** Output file path (optional, defaults to stdout) */
  output?: string;
  /** Whether to include external dependencies (node_modules, etc.) */
  includeExternal?: boolean;
}
