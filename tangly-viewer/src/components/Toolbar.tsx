import {ChevronsDownUpIcon, ChevronsUpDownIcon} from 'lucide-react';
import * as styles from './Toolbar.css';

interface ToolbarProps {
  onCollapseAll: () => void;
  onExpandAll: () => void;
  selectedPath?: string;
}

const Toolbar = ({selectedPath, onCollapseAll, onExpandAll}: ToolbarProps) => {
  return (
    <div className={styles.toolbar}>
      <span className={styles.toolbarIcon} onClick={onExpandAll}>
        <ChevronsUpDownIcon size={16} />
      </span>

      <span className={styles.toolbarIcon} onClick={onCollapseAll}>
        <ChevronsDownUpIcon size={16} />
      </span>
      <span className={styles.selectedPath}>{selectedPath ?? '-'}</span>
    </div>
  );
};

export default Toolbar;
