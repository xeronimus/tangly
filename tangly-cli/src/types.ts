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

export interface ProjectGraph {
  /** Map of file path to graph node */
  nodes: Map<string, GraphNode>;
  /** Import dependency edges with details */
  importEdges: ImportEdge[];
  /** Root directory of the analyzed project */
  rootDir: string;
}

export type OutputFormat = 'json' | 'dot' | 'tree';

export interface ConfigFile {
  /** Output format */
  format?: OutputFormat;
  /** Output file path */
  output?: string;

  /** If specified, use tangly-viewer app */
  app?: string;

  /** Whether to include external dependencies */
  includeExternal?: boolean;
  /** Regex patterns to exclude files from analysis (string or array of strings) */
  exclude?: string | string[];
}
