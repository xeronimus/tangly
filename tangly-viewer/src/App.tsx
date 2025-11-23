import {useEffect, useRef, useState} from 'react';
import {DirectoryNodeData, TreeSelection} from './types';
import {buildDirectoryTree} from './utils/buildDirectoryTree';
import * as styles from './App.css';
import DependencyLines from './components/DependencyLines.tsx';
import buildEdges from './utils/buildEdges.ts';
import {filterEdges} from './utils/filterEdges.ts';

import {JsonOutput} from './importedTypes.ts';
import TreeView from './components/tree/TreeView.tsx';
import Toolbar from './components/Toolbar.tsx';

interface AppProps {
  data: JsonOutput;
}

export function App({data}: AppProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [treeSelection, setTreeSelection] = useState<TreeSelection | null>(null);
  const [tree, setTree] = useState<DirectoryNodeData>(buildDirectoryTree(data.nodes, data.metadata.rootDir));

  useEffect(() => {
    setTree(buildDirectoryTree(data.nodes, data.metadata.rootDir));
  }, [data]);

  const handleNodeCollapsedToggled = (nodePath: string) => {
    setTree(toggleCollapsed(tree, nodePath));
  };

  let edges = buildEdges(data.importEdges, data.metadata.rootDir, tree);
  edges = filterEdges(edges, treeSelection);

  const handleCollapseAll = () => {
    setTree(setAllCollapsedFlags(tree, true));
  };
  const handleExpandAll = () => {
    setTree(setAllCollapsedFlags(tree, false));
  };

  return (
    <div>
      <h1 className={styles.title}>📊 Tangly - Project Graph</h1>

      <h2>{treeSelection?.nodePath}</h2>

      {/* Statistics Section */}
      <div className={styles.stats}>
        <h3 className={styles.statsTitle}>📊 Statistics</h3>
        <div className={styles.statsGrid}>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Total files:</span> {data.metadata.totalFiles}
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Total dependencies:</span> {data.metadata.totalEdges}
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Average dependencies per file:</span>{' '}
            {data.metadata.averageDependencies.toFixed(2)}
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Max dependencies:</span> {data.metadata.maxDependencies}
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Files with no dependencies:</span>{' '}
            {data.metadata.filesWithNoDependencies}
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Files with no dependents:</span> {data.metadata.filesWithNoDependents}
          </div>
        </div>
        {data.metadata.circularDependencies.length === 0 ? (
          <div style={{marginTop: '10px', color: '#4caf50'}}>✅ No circular dependencies detected</div>
        ) : (
          <div style={{marginTop: '10px', color: '#f44336'}}>
            ⚠️ {data.metadata.circularDependencies.length} circular dependencies detected
          </div>
        )}
      </div>

      {/* Main Graph Container */}
      <div ref={containerRef} className={styles.container}>
        <Toolbar
          selectedPath={treeSelection?.nodePath}
          onCollapseAll={handleCollapseAll}
          onExpandAll={handleExpandAll}
        />

        <TreeView
          tree={tree}
          rootDir={data.metadata.rootDir}
          selectedNode={treeSelection}
          onNodeClick={setTreeSelection}
          onNodeCollapsedToggled={handleNodeCollapsedToggled}
        />

        <DependencyLines tree={tree} edges={edges} containerRef={containerRef} />
      </div>
    </div>
  );
}

const toggleCollapsed = (currentNode: DirectoryNodeData, nodePathToToggle: string): DirectoryNodeData => {
  if (currentNode.relativePath === nodePathToToggle) {
    return {...currentNode, collapsed: !currentNode.collapsed};
  }

  return {
    ...currentNode,
    childDirectories: currentNode.childDirectories.map((c) => toggleCollapsed(c, nodePathToToggle))
  };
};

const setAllCollapsedFlags = (currentNode: DirectoryNodeData, collapsed: boolean): DirectoryNodeData => {
  return {
    ...currentNode,
    collapsed,
    childDirectories: currentNode.childDirectories.map((c) => setAllCollapsedFlags(c, collapsed))
  };
};
