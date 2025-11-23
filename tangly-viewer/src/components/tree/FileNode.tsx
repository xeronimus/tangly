import {FileNodeData, TreeSelection} from '../../types.ts';
import * as styles from './FileNode.css';
import IncomingOutgoingSelection from './IncomingOutgoingSelection.tsx';
import {FileIcon} from 'lucide-react';

interface FileNodeProps {
  node: FileNodeData;
  treeSelection: TreeSelection | null;
  onNodeClick: (selection: TreeSelection) => void;
}

const FileNode = ({node, treeSelection, onNodeClick}: FileNodeProps) => {
  const handleNodeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onNodeClick({
      nodePath: node.relativePath,
      isDirectory: false,
      includeIncoming: treeSelection?.includeIncoming ?? true,
      includeOutgoing: treeSelection?.includeOutgoing ?? true
    });
  };

  const handleInOutChange = (incoming: boolean, outgoing: boolean) => {
    onNodeClick({
      nodePath: node.relativePath,
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

  const selected = treeSelection?.nodePath === node.relativePath;
  return (
    <li
      className={`${fileClass} ${selected ? styles.fileItemSelected : ''}`}
      onClick={handleNodeClick}
      data-file-path={node.relativePath}
    >
      <span>
        <FileIcon size={12} fill="rgba(100,100,100,0.8)" />
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
};

export default FileNode;
