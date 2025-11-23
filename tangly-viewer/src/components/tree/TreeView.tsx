import * as styles from './TreeView.css';
import DirectoryNode from './DirectoryNode.tsx';
import {DirectoryNodeData, TreeSelection} from '../../types.ts';

interface TreeViewProps {
  dirTree: DirectoryNodeData;
  rootDir: string;
  selectedNode: TreeSelection | null;
  onNodeClick: (selection: TreeSelection) => void;
}

const TreeView = ({dirTree, rootDir, selectedNode, onNodeClick}: TreeViewProps) => {
  return (
    <div className={styles.treeWrapper}>
      <ol className={styles.tree}>
        <DirectoryNode
          node={dirTree}
          rootDir={rootDir}
          treeSelection={selectedNode}
          onNodeClick={onNodeClick}
          isRoot={true}
        />
      </ol>
    </div>
  );
};

export default TreeView;
