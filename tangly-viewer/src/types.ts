export type EdgeClass = 'import-regular' | 'import-type' | 'import-side-effect';

export interface EdgeWithClass {
  from: string;
  to: string;
  class: EdgeClass;
}

export interface DirectoryNodeData {
  relativePath: string;
  absolutePath: string;
  name: string;
  childDirectories: DirectoryNodeData[];
  files: FileNodeData[];
}

export interface FileNodeData {
  relativePath: string;
  absolutePath: string;
  name: string;
  dependencies: string[];
  dependents: string[];
  parent?: string;
}

export interface TreeSelection {
  nodePath: string;
  isDirectory: boolean;
  includeIncoming: boolean;
  includeOutgoing: boolean;
}
