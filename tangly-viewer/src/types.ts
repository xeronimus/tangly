export interface ImportInfo {
  names: string[];
  type: 'default' | 'named' | 'namespace' | 'side-effect' | 'type';
  isTypeOnly: boolean;
}

export interface ImportEdge {
  from: string;
  to: string;
  imports: ImportInfo[];
}

export interface FileNode {
  path: string;
  relativePath: string;
  dependencies: string[];
  dependents: string[];
  parent?: string; // Optional to match JSON formatter output
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

export interface ProjectGraphData {
  metadata: ProjectGraphMetadata;
  nodes: FileNode[];
  importEdges: ImportEdge[];
}

export interface EdgeWithClass {
  from: string;
  to: string;
  class: 'import-regular' | 'import-type' | 'import-side-effect';
}

export interface DirNode {
  path: string;
  name: string;
  children: DirNode[];
  files: FileNode[];
}
