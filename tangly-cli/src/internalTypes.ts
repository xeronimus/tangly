import {GraphNode, ImportEdge, ProjectGraphMetadata} from './publicTypes';

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

export interface ProjectGraph {
  /** Map of file path to graph node */
  nodes: Map<string, GraphNode>;
  /** Import dependency edges with details */
  importEdges: ImportEdge[];
  /**  **/
  metadata: ProjectGraphMetadata;
}
