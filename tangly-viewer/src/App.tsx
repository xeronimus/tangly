import {useRef, useState} from 'react';
import {ProjectGraphData, EdgeWithClass, TreeSelection} from './types';
import {TreeView} from './components/TreeView';
import {buildDirectoryTree} from './utils/buildDirectoryTree';
import * as styles from './App.css';
import DependencyLines from './components/DependencyLines.tsx';
import buildEdges from './utils/buildEdges.ts';
import {filterEdges} from './utils/filterEdges.ts';

interface AppProps {
  data: ProjectGraphData;
}

export function App({data}: AppProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [treeSelection, setTreeSelection] = useState<TreeSelection | null>(null);

  // Build directory tree from file nodes
  const dirTree = buildDirectoryTree(data.nodes, data.metadata.rootDir);

  const edges: EdgeWithClass[] = buildEdges(filterEdges(data.importEdges, treeSelection), data.metadata.rootDir);

  // Convert import edges to edges with classes

  const handleNodeClick = (nodePath: string, isDirectory: boolean) => {
    if (treeSelection?.nodePath === nodePath) {
      setTreeSelection(null);
    } else {
      setTreeSelection({
        nodePath,
        isDirectory
      });
    }
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
          <div style={{marginTop: '10px', color: '#4caf50'}}>✅ No circular dependencies detected!</div>
        ) : (
          <div style={{marginTop: '10px', color: '#f44336'}}>
            ⚠️ {data.metadata.circularDependencies.length} circular dependencies detected
          </div>
        )}
      </div>

      {/* Main Graph Container */}
      <div ref={containerRef} className={styles.container}>
        <TreeView
          dirTree={dirTree}
          rootDir={data.metadata.rootDir}
          selectedNode={treeSelection}
          onNodeClick={handleNodeClick}
        />

        <DependencyLines edges={edges} containerRef={containerRef} />
      </div>

      {/* Legend */}
      <div className={styles.legend}>
        <h3 className={styles.legendTitle}>Legend</h3>
        <div>
          <span className={styles.legendItem}>
            <span className={`${styles.legendLine} ${styles.legendLineRegular}`}></span> Regular Import
          </span>
          <span className={styles.legendItem}>
            <span className={`${styles.legendLine} ${styles.legendLineType}`}></span> Type-only Import
          </span>
          <span className={styles.legendItem}>
            <span className={`${styles.legendLine} ${styles.legendLineSideEffect}`}></span> Side-effect Import
          </span>
        </div>
        <div style={{marginTop: '10px'}}>
          <span className={styles.legendItem}>📄 File</span>
          <span className={styles.legendItem}>📁 Folder (click to filter)</span>
        </div>
      </div>
    </div>
  );
}
