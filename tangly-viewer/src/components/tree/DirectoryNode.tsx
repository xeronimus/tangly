import {ChevronDownIcon, ChevronRightIcon, FolderIcon} from 'lucide-react';
import {DirectoryNodeData, TreeSelection} from '../../types.ts';
import * as styles from './DirectoryNode.css';
import IncomingOutgoingSelection from './IncomingOutgoingSelection.tsx';
import FileNode from './FileNode.tsx';

interface DirectoryNodeProps {
  node: DirectoryNodeData;
  rootDir: string;
  treeSelection: TreeSelection | null;
  onNodeClick: (selection: TreeSelection) => void;
  onNodeCollapsedToggled: (nodePath: string) => void;
  isRoot?: boolean;
}

const DirectoryNode = ({
  node,
  rootDir,
  treeSelection,
  onNodeClick,
  onNodeCollapsedToggled,
  isRoot = false
}: DirectoryNodeProps) => {
  const hasContent = !node.collapsed && (node.files.length > 0 || node.childDirectories.length > 0);

  const handleNodeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onNodeClick({
      nodePath: node.relativePath,
      isDirectory: true,
      includeIncoming: treeSelection?.includeIncoming ?? true,
      includeOutgoing: treeSelection?.includeOutgoing ?? true
    });
  };

  const handleInOutChange = (incoming: boolean, outgoing: boolean) => {
    onNodeClick({
      nodePath: node.relativePath,
      isDirectory: true,
      includeIncoming: incoming,
      includeOutgoing: outgoing
    });
  };

  const handleCollapseToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    onNodeCollapsedToggled(node.relativePath);
  };

  const selected = treeSelection?.nodePath === node.relativePath;

  return (
    <>
      {!isRoot && (
        <li
          className={`${styles.directoryItem} ${selected ? styles.directoryItemSelected : ''}`}
          data-file-path={node.relativePath}
          onClick={handleNodeClick}
        >
          <span>
            {node.collapsed && <ChevronRightIcon size={12} onClick={handleCollapseToggle} />}
            {!node.collapsed && <ChevronDownIcon size={12} onClick={handleCollapseToggle} />}
            <FolderIcon size={12} fill="rgba(100,100,100,0.8)" />
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
              {node.childDirectories.map((child) => (
                <DirectoryNode
                  key={child.relativePath}
                  node={child}
                  rootDir={rootDir}
                  treeSelection={treeSelection}
                  onNodeClick={onNodeClick}
                  onNodeCollapsedToggled={onNodeCollapsedToggled}
                />
              ))}
              {node.files.map((file) => (
                <FileNode key={file.relativePath} node={file} treeSelection={treeSelection} onNodeClick={onNodeClick} />
              ))}
            </ol>
          )}
        </li>
      )}
      {isRoot && (
        <>
          {node.childDirectories.map((child) => (
            <DirectoryNode
              key={child.relativePath}
              node={child}
              rootDir={rootDir}
              treeSelection={treeSelection}
              onNodeClick={onNodeClick}
              onNodeCollapsedToggled={onNodeCollapsedToggled}
            />
          ))}
          {node.files.map((file) => (
            <FileNode key={file.relativePath} node={file} treeSelection={treeSelection} onNodeClick={onNodeClick} />
          ))}
        </>
      )}
    </>
  );
};

export default DirectoryNode;
