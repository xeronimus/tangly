import {FileNode, DirNode, TreeSelection} from '../types';

import * as styles from './TreeView.css.ts';

interface TreeViewProps {
  dirTree: DirNode;
  rootDir: string;
  selectedNode: TreeSelection | null;
  onNodeClick: (nodePath: string, isDirectory: boolean) => void;
}

export function TreeView({dirTree, rootDir, selectedNode, onNodeClick}: TreeViewProps) {
  return (
    <div className={styles.treeWrapper}>
      <ol className={styles.tree}>
        <DirNodeComponent
          node={dirTree}
          rootDir={rootDir}
          selectedNode={selectedNode}
          onNodeClick={onNodeClick}
          isRoot={true}
        />
      </ol>
    </div>
  );
}

interface DirNodeComponentProps {
  node: DirNode;
  rootDir: string;
  selectedNode: TreeSelection | null;
  onNodeClick: (nodePath: string, isDirectory: boolean) => void;
  isRoot?: boolean;
}

function DirNodeComponent({node, rootDir, selectedNode, onNodeClick, isRoot = false}: DirNodeComponentProps) {
  const hasContent = node.files.length > 0 || node.children.length > 0;

  const handleNodeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onNodeClick(node.path, true);
  };

  return (
    <>
      {!isRoot && (
        <li
          className={`${styles.directoryItem} ${selectedNode?.nodePath === node.path ? styles.directoryItemSelected : ''}`}
          data-folder-path={node.path}
          onClick={handleNodeClick}
        >
          <span>{node.name}/</span>
          {hasContent && (
            <ol className={styles.treeNodeList}>
              {node.files.map((file) => (
                <FileNodeComponent
                  key={file.path}
                  node={file}
                  rootDir={rootDir}
                  selectedNode={selectedNode}
                  onNodeClick={onNodeClick}
                />
              ))}
              {node.children.map((child) => (
                <DirNodeComponent
                  key={child.path}
                  node={child}
                  rootDir={rootDir}
                  selectedNode={selectedNode}
                  onNodeClick={onNodeClick}
                />
              ))}
            </ol>
          )}
        </li>
      )}
      {isRoot && (
        <>
          {node.files.map((file) => (
            <FileNodeComponent
              key={file.path}
              node={file}
              rootDir={rootDir}
              selectedNode={selectedNode}
              onNodeClick={onNodeClick}
            />
          ))}
          {node.children.map((child) => (
            <DirNodeComponent
              key={child.path}
              node={child}
              rootDir={rootDir}
              selectedNode={selectedNode}
              onNodeClick={onNodeClick}
            />
          ))}
        </>
      )}
    </>
  );
}

interface FileNodeComponentProps {
  node: FileNode;
  rootDir: string;
  selectedNode: TreeSelection | null;
  onNodeClick: (nodePath: string, isDirectory: boolean) => void;
}

function FileNodeComponent({node, rootDir, selectedNode, onNodeClick}: FileNodeComponentProps) {
  const handleNodeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onNodeClick(node.path, false);
  };

  const fileName = node.relativePath.split('/').pop() || node.relativePath;

  let fileClass = styles.fileItem;
  if (node.dependencies.length === 0 && node.dependents.length > 0) {
    fileClass = `${styles.fileItem} ${styles.leafFile}`;
  } else if (node.dependents.length === 0 && node.dependencies.length > 0) {
    fileClass = `${styles.fileItem} ${styles.entryPoint}`;
  }

  const folderPath = node.parent || rootDir;

  return (
    <li
      className={`${fileClass} ${selectedNode?.nodePath === node.path ? styles.fileItemSelected : ''}`}
      onClick={handleNodeClick}
      data-file-path={node.path.replace(rootDir, '')}
      data-folder={folderPath}
    >
      <span>{fileName}</span>
    </li>
  );
}
