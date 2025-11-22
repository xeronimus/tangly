import {FileNode, DirNode, TreeSelection} from '../types';

import * as styles from './TreeView.css.ts';

interface TreeViewProps {
  dirTree: DirNode;
  rootDir: string;
  selectedNode: TreeSelection | null;
  onNodeClick: (selection: TreeSelection) => void;
}

export function TreeView({dirTree, rootDir, selectedNode, onNodeClick}: TreeViewProps) {
  return (
    <div className={styles.treeWrapper}>
      <ol className={styles.tree}>
        <DirNodeComponent
          node={dirTree}
          rootDir={rootDir}
          treeSelection={selectedNode}
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
  treeSelection: TreeSelection | null;
  onNodeClick: (selection: TreeSelection) => void;
  isRoot?: boolean;
}

function DirNodeComponent({node, rootDir, treeSelection, onNodeClick, isRoot = false}: DirNodeComponentProps) {
  const hasContent = node.files.length > 0 || node.children.length > 0;

  const handleNodeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onNodeClick({
      nodePath: node.path,
      isDirectory: true,
      includeIncoming: treeSelection?.includeIncoming ?? true,
      includeOutgoing: treeSelection?.includeOutgoing ?? true
    });
  };

  const handleInOutChange = (incoming: boolean, outgoing: boolean) => {
    onNodeClick({
      nodePath: node.path,
      isDirectory: true,
      includeIncoming: incoming,
      includeOutgoing: outgoing
    });
  };

  const selected = treeSelection?.nodePath === node.path;

  return (
    <>
      {!isRoot && (
        <li
          className={`${styles.directoryItem} ${selected ? styles.directoryItemSelected : ''}`}
          data-folder-path={node.path}
          onClick={handleNodeClick}
        >
          <span>
            {node.name}{' '}
            {selected && (
              <IncomingOutgoingSelection
                incoming={treeSelection?.includeIncoming}
                outgoing={treeSelection?.includeOutgoing}
                onChange={handleInOutChange}
              />
            )}
          </span>

          {hasContent && (
            <ol className={styles.treeNodeList}>
              {node.files.map((file) => (
                <FileNodeComponent
                  key={file.path}
                  node={file}
                  rootDir={rootDir}
                  treeSelection={treeSelection}
                  onNodeClick={onNodeClick}
                />
              ))}
              {node.children.map((child) => (
                <DirNodeComponent
                  key={child.path}
                  node={child}
                  rootDir={rootDir}
                  treeSelection={treeSelection}
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
              treeSelection={treeSelection}
              onNodeClick={onNodeClick}
            />
          ))}
          {node.children.map((child) => (
            <DirNodeComponent
              key={child.path}
              node={child}
              rootDir={rootDir}
              treeSelection={treeSelection}
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
  treeSelection: TreeSelection | null;
  onNodeClick: (selection: TreeSelection) => void;
}

function FileNodeComponent({node, rootDir, treeSelection, onNodeClick}: FileNodeComponentProps) {
  const handleNodeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onNodeClick({
      nodePath: node.path,
      isDirectory: false,
      includeIncoming: treeSelection?.includeIncoming ?? true,
      includeOutgoing: treeSelection?.includeOutgoing ?? true
    });
  };

  const handleInOutChange = (incoming: boolean, outgoing: boolean) => {
    onNodeClick({
      nodePath: node.path,
      isDirectory: false,
      includeIncoming: incoming,
      includeOutgoing: outgoing
    });
  };

  const fileName = node.relativePath.split('/').pop() || node.relativePath;

  let fileClass = styles.fileItem;
  if (node.dependencies.length === 0 && node.dependents.length > 0) {
    fileClass = `${styles.fileItem} ${styles.leafFile}`;
  } else if (node.dependents.length === 0 && node.dependencies.length > 0) {
    fileClass = `${styles.fileItem} ${styles.entryPoint}`;
  }

  const folderPath = node.parent || rootDir;

  const selected = treeSelection?.nodePath === node.path;
  return (
    <li
      className={`${fileClass} ${selected ? styles.fileItemSelected : ''}`}
      onClick={handleNodeClick}
      data-file-path={node.path.replace(rootDir, '')}
      data-folder={folderPath}
    >
      <span>
        {fileName}{' '}
        {selected && (
          <IncomingOutgoingSelection
            incoming={treeSelection?.includeIncoming}
            outgoing={treeSelection?.includeOutgoing}
            onChange={handleInOutChange}
          />
        )}
      </span>
    </li>
  );
}

interface IncomingOutgoingSelectionProps {
  incoming: boolean;
  outgoing: boolean;
  onChange?: (incoming: boolean, outgoing: boolean) => void;
}

const IncomingOutgoingSelection = ({incoming, outgoing, onChange}: IncomingOutgoingSelectionProps) => {
  const handleIncClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange?.(!incoming, outgoing);
  };
  const handleOutClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange?.(incoming, !outgoing);
  };

  return (
    <span className={styles.treeItemToggles}>
      <span onClick={handleIncClick}>
        {incoming ? (
          <i className="icon icon-left-circle" title="Toggle incoming dependencies" />
        ) : (
          <i className="icon icon-left-circled" />
        )}
      </span>
      <span onClick={handleOutClick}>
        {outgoing ? (
          <i className="icon icon-right-circle" title="Toggle outgoing dependencies" />
        ) : (
          <i className="icon icon-right-circled" />
        )}
      </span>
    </span>
  );
};
