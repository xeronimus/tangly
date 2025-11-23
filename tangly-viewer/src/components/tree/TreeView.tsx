import * as styles from './TreeView.css';
import DirectoryNode from './DirectoryNode.tsx';
import {DirectoryNodeData, TreeSelection} from '../../types.ts';

interface TreeViewProps {
  tree: DirectoryNodeData;
  rootDir: string;
  selectedNode: TreeSelection | null;
  onNodeClick: (selection: TreeSelection) => void;
  onNodeCollapsedToggled: (nodePath: string) => void;
}

const TreeView = ({tree, rootDir, selectedNode, onNodeClick, onNodeCollapsedToggled}: TreeViewProps) => {
  return (
    <div className={styles.treeWrapper}>
      <ol className={styles.tree}>
        <DirectoryNode
          isRoot={true}
          node={tree}
          rootDir={rootDir}
          treeSelection={selectedNode}
          onNodeClick={onNodeClick}
          onNodeCollapsedToggled={onNodeCollapsedToggled}
        />
      </ol>
    </div>
  );
};

export default TreeView;
