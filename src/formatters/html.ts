import {ProjectGraph} from '../types';
import * as path from 'path';

/**
 * Format project graph as interactive HTML with tree view and SVG dependency lines
 */
export function formatAsHtml(graph: ProjectGraph): string {
  const lines: string[] = [];

  // HTML header
  lines.push('<!DOCTYPE html>');
  lines.push('<html lang="en">');
  lines.push('<head>');
  lines.push('  <meta charset="UTF-8">');
  lines.push('  <meta name="viewport" content="width=device-width, initial-scale=1.0">');
  lines.push('  <title>Tangly - Project Graph</title>');
  lines.push('  <style>');
  lines.push(`    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', sans-serif;
      margin: 0;
      padding: 20px;
      background: #f5f5f5;
      color: #333;
    }

    h1 {
      color: #1976d2;
      margin-bottom: 20px;
    }

    #container {
      position: relative;
      background: white;
      padding: 30px;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      min-height: 400px;
    }

    #dependency-svg {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 1;
    }

    .tree-wrapper {
      position: relative;
      z-index: 2;
    }

    .tree {
      list-style: none;
      padding-left: 0;
      margin: 0;
    }

    .tree ol {
      list-style: none;
      padding-left: 24px;
      margin: 2px 0;
    }

    .tree li {
      margin: 2px 0;
      padding: 6px 10px;
      border-radius: 4px;
      transition: background 0.2s;
      position: relative;
    }

    .tree li.file {
      color: #1976d2;
      font-family: 'Consolas', 'Monaco', monospace;
      font-size: 14px;
    }

    .tree li.directory {
      font-weight: 600;
      color: #424242;
      margin-top: 8px;
    }

    .tree li.file::before {
      content: '📄 ';
      margin-right: 4px;
    }

    .tree li.directory::before {
      content: '📁 ';
      margin-right: 4px;
    }

    .tree li.directory.selected {
      font-weight: bold;
    }

    .tree li.directory.selected::before {
      content: '🔶 📂 ';
    }

    .tree li.file.entry-point {
    }

    .tree li.file.leaf {
    }

    .dependency-line {
      stroke-width: 2;
      fill: none;
      opacity: 0.5;
      transition: opacity 0.2s;
    }

    .dependency-line:hover {
      opacity: 1;
      stroke-width: 3;
    }

    .import-regular {
      stroke: #d32f2f;
    }

    .import-type {
      stroke: #1976d2;
    }

    .import-side-effect {
      stroke: #f57c00;
      stroke-dasharray: 5,5;
    }

    .legend {
      margin-top: 20px;
      padding: 15px;
      background: #f5f5f5;
      border-radius: 4px;
    }

    .legend h3 {
      margin-top: 0;
      font-size: 16px;
    }

    .legend-item {
      display: inline-block;
      margin-right: 20px;
      font-size: 14px;
    }

    .legend-line {
      display: inline-block;
      width: 30px;
      height: 2px;
      margin-right: 5px;
      vertical-align: middle;
    }

    .legend-line.regular { background: #d32f2f; }
    .legend-line.type { background: #1976d2; }
    .legend-line.side-effect {
      background: linear-gradient(to right, #f57c00 50%, transparent 50%);
      background-size: 10px 2px;
    }
  `);
  lines.push('  </style>');
  lines.push('</head>');
  lines.push('<body>');
  lines.push('  <h1>📊 Tangly - Project Graph</h1>');
  lines.push('  <div id="container">');
  lines.push('    <svg id="dependency-svg"></svg>');
  lines.push('    <div class="tree-wrapper">');
  lines.push('      <ol class="tree">');

  // Build directory tree
  interface DirNode {
    path: string;
    name: string;
    children: DirNode[];
    files: string[];
  }

  const dirToFiles = new Map<string, string[]>();
  for (const node of graph.nodes.values()) {
    const parentDir = node.parent || graph.rootDir;
    if (!dirToFiles.has(parentDir)) {
      dirToFiles.set(parentDir, []);
    }
    dirToFiles.get(parentDir)!.push(node.path);
  }

  const allDirs = new Set(dirToFiles.keys());
  const dirTree = buildDirectoryTree(Array.from(allDirs), graph.rootDir);

  // Generate tree HTML recursively
  function generateTreeHtml(dirNode: DirNode, indent: number = 0): void {
    const indentStr = '        ' + '  '.repeat(indent);
    const filesInDir = Array.from(graph.nodes.values()).filter(
      (node) => (node.parent || graph.rootDir) === dirNode.path
    );

    // Add directory label if not root
    if (dirNode.path !== graph.rootDir) {
      const dirLabel = path.basename(dirNode.path);
      lines.push(
        `${indentStr}<li class="directory" data-folder-path="${escapeHtml(normalizePath(dirNode.path))}"><span>${escapeHtml(dirLabel)}/</span>`
      );
      if (filesInDir.length > 0 || dirNode.children.length > 0) {
        lines.push(`${indentStr}  <ol>`);
      }
    }

    // Add files in this directory
    for (const fileNode of filesInDir) {
      const fileName = path.basename(fileNode.path);

      // Determine file class based on role
      let fileClass = 'file';
      if (fileNode.dependencies.length === 0 && fileNode.dependents.length > 0) {
        fileClass = 'file leaf';
      } else if (fileNode.dependents.length === 0 && fileNode.dependencies.length > 0) {
        fileClass = 'file entry-point';
      }

      const folderPath = normalizePath(fileNode.parent || graph.rootDir);
      lines.push(
        `${indentStr}${dirNode.path === graph.rootDir ? '' : '  '}<li class="${fileClass}" data-file-path="${escapeHtml(normalizePath(fileNode.path))}" data-folder="${escapeHtml(folderPath)}"><span>${escapeHtml(fileName)}</span></li>`
      );
    }

    // Add child directories
    for (const child of dirNode.children) {
      generateTreeHtml(child, dirNode.path === graph.rootDir ? indent : indent + 1);
    }

    // Close directory ol and li
    if (dirNode.path !== graph.rootDir) {
      if (filesInDir.length > 0 || dirNode.children.length > 0) {
        lines.push(`${indentStr}  </ol>`);
      }
      lines.push(`${indentStr}</li>`);
    }
  }

  generateTreeHtml(dirTree);

  lines.push('      </ol>');
  lines.push('    </div>');
  lines.push('  </div>');

  // Legend
  lines.push('  <div class="legend">');
  lines.push('    <h3>Legend</h3>');
  lines.push('    <div>');
  lines.push('      <span class="legend-item"><span class="legend-line regular"></span> Regular Import</span>');
  lines.push('      <span class="legend-item"><span class="legend-line type"></span> Type-only Import</span>');
  lines.push('      <span class="legend-item"><span class="legend-line side-effect"></span> Side-effect Import</span>');
  lines.push('    </div>');
  lines.push('    <div style="margin-top: 10px;">');
  lines.push('      <span class="legend-item">📄 File</span>');
  lines.push('    </div>');
  lines.push('  </div>');

  // JavaScript for drawing dependency lines
  lines.push('  <script>');
  lines.push('    const edges = [');

  for (const edge of graph.importEdges) {
    const isTypeOnly = edge.imports.some((imp) => imp.isTypeOnly);
    const isSideEffect = edge.imports.some((imp) => imp.type === 'side-effect');

    let edgeClass = 'import-regular';
    if (isSideEffect) {
      edgeClass = 'import-side-effect';
    } else if (isTypeOnly) {
      edgeClass = 'import-type';
    }

    lines.push(
      `      {from: "${escapeJs(normalizePath(edge.from))}", to: "${escapeJs(normalizePath(edge.to))}", class: "${edgeClass}"},`
    );
  }

  lines.push('    ];');
  lines.push('');
  lines.push('    const svg = document.getElementById("dependency-svg");');
  lines.push('    const container = document.getElementById("container");');
  lines.push('    let selectedFolder = null;');
  lines.push('');
  lines.push('    function drawLines() {');
  lines.push('      svg.innerHTML = "";');
  lines.push('');
  lines.push('      const containerRect = container.getBoundingClientRect();');
  lines.push('      svg.setAttribute("width", containerRect.width);');
  lines.push('      svg.setAttribute("height", containerRect.height);');
  lines.push('');
  lines.push('      edges.forEach(edge => {');
  lines.push('        const fromEl = document.querySelector(`[data-file-path="${edge.from}"] span`);');
  lines.push('        const toEl = document.querySelector(`[data-file-path="${edge.to}"] span`);');
  lines.push('');
  lines.push('        if (!fromEl || !toEl) return;');
  lines.push('');
  lines.push('        // Filter based on selected folder');
  lines.push('        if (selectedFolder) {');
  lines.push('          const fromLi = fromEl.parentElement;');
  lines.push('          const toLi = toEl.parentElement;');
  lines.push('          const fromFolder = fromLi.getAttribute("data-folder");');
  lines.push('          const toFolder = toLi.getAttribute("data-folder");');
  lines.push('          if (fromFolder !== selectedFolder && toFolder !== selectedFolder) {');
  lines.push('            return; // Skip this edge if neither endpoint is in selected folder');
  lines.push('          }');
  lines.push('        }');
  lines.push('');
  lines.push('        const fromRect = fromEl.getBoundingClientRect();');
  lines.push('        const toRect = toEl.getBoundingClientRect();');
  lines.push('');
  lines.push('        const x1 = fromRect.left - containerRect.left + fromRect.width;');
  lines.push('        const y1 = fromRect.top - containerRect.top + 2  ;');
  lines.push('        const x2 = toRect.left - containerRect.left + toRect.width;');
  lines.push('        const y2 = toRect.top - containerRect.top + toRect.height - 2;');
  lines.push('');
  lines.push('        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");');
  lines.push('');
  lines.push('        // Create arc to the right of the tree');
  lines.push('        const midX = Math.max(x1, x2) + 400; // Extend 100px to the right');
  lines.push('        const midY = (y1 + y2) / 2;');
  lines.push('        const controlOffset = 50;');
  lines.push('');
  lines.push('        // Path: start -> arc right to midpoint -> arc back to end');
  lines.push(
    '        const d = `M ${x1} ${y1} C ${x1 + controlOffset} ${y1}, ${midX - controlOffset} ${y1}, ${midX} ${midY} S ${midX - controlOffset} ${y2}, ${x2} ${y2}`;'
  );
  lines.push('');
  lines.push('        path.setAttribute("d", d);');
  lines.push('        path.setAttribute("class", "dependency-line " + edge.class);');
  lines.push('');
  lines.push('        const title = document.createElementNS("http://www.w3.org/2000/svg", "title");');
  lines.push('        title.textContent = `${edge.from} → ${edge.to}`;');
  lines.push('        path.appendChild(title);');
  lines.push('');
  lines.push('        svg.appendChild(path);');
  lines.push('      });');
  lines.push('    }');
  lines.push('');
  lines.push('    // Handle folder selection');
  lines.push('    function setupFolderSelection() {');
  lines.push('      const folders = document.querySelectorAll(".tree li.directory");');
  lines.push('      folders.forEach(folder => {');
  lines.push('        folder.addEventListener("click", (e) => {');
  lines.push('          e.stopPropagation(); // Prevent event bubbling');
  lines.push('          const folderPath = folder.getAttribute("data-folder-path");');
  lines.push('          ');
  lines.push('          // Toggle selection');
  lines.push('          if (selectedFolder === folderPath) {');
  lines.push('            selectedFolder = null;');
  lines.push('            folders.forEach(f => f.classList.remove("selected"));');
  lines.push('          } else {');
  lines.push('            selectedFolder = folderPath;');
  lines.push('            folders.forEach(f => f.classList.remove("selected"));');
  lines.push('            folder.classList.add("selected");');
  lines.push('          }');
  lines.push('          ');
  lines.push('          drawLines();');
  lines.push('        });');
  lines.push('      });');
  lines.push('    }');
  lines.push('');
  lines.push('    // Draw lines on initial load');
  lines.push('    window.addEventListener("load", () => {');
  lines.push('      drawLines();');
  lines.push('      setupFolderSelection();');
  lines.push('    });');
  lines.push('');
  lines.push('    // Redraw when container size changes');
  lines.push('    const resizeObserver = new ResizeObserver(drawLines);');
  lines.push('    resizeObserver.observe(container);');
  lines.push('  </script>');
  lines.push('</body>');
  lines.push('</html>');

  return lines.join('\n');
}

/**
 * Build a tree structure of directories
 */
function buildDirectoryTree(
  dirPaths: string[],
  rootDir: string
): {
  path: string;
  name: string;
  children: any[];
  files: string[];
} {
  const root = {
    path: rootDir,
    name: path.basename(rootDir) || 'root',
    children: [] as any[],
    files: []
  };

  const nodeMap = new Map<string, any>();
  nodeMap.set(rootDir, root);

  const sortedDirs = dirPaths.sort((a, b) => {
    const depthA = a.split(path.sep).length;
    const depthB = b.split(path.sep).length;
    return depthA - depthB;
  });

  for (const dirPath of sortedDirs) {
    if (dirPath === rootDir) continue;

    const parentPath = path.dirname(dirPath);
    const parentNode = nodeMap.get(parentPath);

    if (parentNode) {
      const node = {
        path: dirPath,
        name: path.basename(dirPath),
        children: [] as any[],
        files: []
      };
      parentNode.children.push(node);
      nodeMap.set(dirPath, node);
    }
  }

  return root;
}

/**
 * Normalize path to use forward slashes
 */
function normalizePath(filePath: string): string {
  return filePath.replace(/\\/g, '/');
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Escape JavaScript string special characters
 */
function escapeJs(text: string): string {
  return text.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n').replace(/\r/g, '\\r');
}
