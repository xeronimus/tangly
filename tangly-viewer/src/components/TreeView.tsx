import {FileNode, DirNode} from '../types';
import * as styles from '../App.css';

interface TreeViewProps {
  dirTree: DirNode;
  rootDir: string;
  selectedFolder: string | null;
  onFolderClick: (folderPath: string) => void;
}

export function TreeView({dirTree, rootDir, selectedFolder, onFolderClick}: TreeViewProps) {
  return (
    <div className={styles.treeWrapper}>
      <ol className={styles.tree}>
        <DirNodeComponent
          node={dirTree}
          rootDir={rootDir}
          selectedFolder={selectedFolder}
          onFolderClick={onFolderClick}
          isRoot={true}
        />
      </ol>
    </div>
  );
}

interface DirNodeComponentProps {
  node: DirNode;
  rootDir: string;
  selectedFolder: string | null;
  onFolderClick: (folderPath: string) => void;
  isRoot?: boolean;
}

function DirNodeComponent({node, rootDir, selectedFolder, onFolderClick, isRoot = false}: DirNodeComponentProps) {
  const handleFolderClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFolderClick(node.path);
  };

  const hasContent = node.files.length > 0 || node.children.length > 0;

  return (
    <>
      {!isRoot && (
        <li
          className={`${styles.directoryItem} ${selectedFolder === node.path ? styles.selectedDirectory : ''}`}
          data-folder-path={node.path}
          onClick={handleFolderClick}
        >
          {node.name}/
          {hasContent && (
            <ol>
              {node.files.map((file) => (
                <FileNodeComponent key={file.path} file={file} rootDir={rootDir} />
              ))}
              {node.children.map((child) => (
                <DirNodeComponent
                  key={child.path}
                  node={child}
                  rootDir={rootDir}
                  selectedFolder={selectedFolder}
                  onFolderClick={onFolderClick}
                />
              ))}
            </ol>
          )}
        </li>
      )}
      {isRoot && (
        <>
          {node.files.map((file) => (
            <FileNodeComponent key={file.path} file={file} rootDir={rootDir} />
          ))}
          {node.children.map((child) => (
            <DirNodeComponent
              key={child.path}
              node={child}
              rootDir={rootDir}
              selectedFolder={selectedFolder}
              onFolderClick={onFolderClick}
            />
          ))}
        </>
      )}
    </>
  );
}

interface FileNodeComponentProps {
  file: FileNode;
  rootDir: string;
}

function FileNodeComponent({file, rootDir}: FileNodeComponentProps) {
  const fileName = file.relativePath.split('/').pop() || file.relativePath;

  let fileClass = styles.fileItem;
  if (file.dependencies.length === 0 && file.dependents.length > 0) {
    fileClass = `${styles.fileItem} ${styles.leafFile}`;
  } else if (file.dependents.length === 0 && file.dependencies.length > 0) {
    fileClass = `${styles.fileItem} ${styles.entryPoint}`;
  }

  const folderPath = file.parent || rootDir;

  return (
    <li className={fileClass} data-file-path={file.path} data-folder={folderPath}>
      <span>{fileName}</span>
    </li>
  );
}
