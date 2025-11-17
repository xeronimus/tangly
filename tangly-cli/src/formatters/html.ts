import {ProjectGraph} from '../types';
import * as path from 'path';
import * as fs from 'node:fs';

/**
 * Format project graph as interactive HTML with tree view and SVG dependency lines
 */
export function formatAsHtml(graph: ProjectGraph): string {
  const treeHtml = generateTreeHtml(graph);
  const edgesJson = generateEdgesJson(graph);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tangly - Project Graph</title>
  <style>
    ${readTemplateFileContent('style.css')}
  </style>
</head>
<body>
  <h1>📊 Tangly - Project Graph</h1>
  <div id="container">
    <svg id="dependency-svg"></svg>
    <div class="tree-wrapper">
      <ol class="tree">
          ${treeHtml}
      </ol>
    </div>
  </div>

  <div class="legend">
    <h3>Legend</h3>
    <div>
      <span class="legend-item"><span class="legend-line regular"></span> Regular Import</span>
      <span class="legend-item"><span class="legend-line type"></span> Type-only Import</span>
      <span class="legend-item"><span class="legend-line side-effect"></span> Side-effect Import</span>
    </div>
    <div style="margin-top: 10px;">
      <span class="legend-item">📄 File</span>
    </div>
  </div>

  <script>
    ${generateJavaScript(graph.rootDir, edgesJson)}
  </script>
</body>
</html>`;
}

/**
 * Generate edges JSON for JavaScript
 */
function generateEdgesJson(graph: ProjectGraph): string {
  const edges = graph.importEdges.map((edge) => {
    const isTypeOnly = edge.imports.some((imp) => imp.isTypeOnly);
    const isSideEffect = edge.imports.some((imp) => imp.type === 'side-effect');

    let edgeClass = 'import-regular';
    if (isSideEffect) {
      edgeClass = 'import-side-effect';
    } else if (isTypeOnly) {
      edgeClass = 'import-type';
    }

    return {
      from: normalizePath(edge.from),
      to: normalizePath(edge.to),
      class: edgeClass
    };
  });

  return JSON.stringify(edges, null, 2);
}

/**
 * Generate JavaScript code for drawing dependency lines
 */
function generateJavaScript(rootPath: string, edgesJson: string): string {
  return `
  window.tangly_root = "${normalizePath(rootPath)}/";
  window.tangly_edges = ${edgesJson};
  ${readTemplateFileContent('script.js')}
  `;
}

/**
 * Generate tree HTML recursively
 */
function generateTreeHtml(graph: ProjectGraph): string {
  // Group files by their parent directory
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

  const htmlParts: string[] = [];

  function generateDirHtml(dirNode: DirNode, indent: number = 0): void {
    const indentStr = '        ' + '  '.repeat(indent);
    const filesInDir = Array.from(graph.nodes.values()).filter(
      (node) => (node.parent || graph.rootDir) === dirNode.path
    );

    // Add directory label if not root
    if (dirNode.path !== graph.rootDir) {
      const dirLabel = path.basename(dirNode.path);
      htmlParts.push(
        `${indentStr}<li class="directory" data-folder-path="${escapeHtml(normalizePath(dirNode.path))}">${escapeHtml(dirLabel)}/`
      );
      if (filesInDir.length > 0 || dirNode.children.length > 0) {
        htmlParts.push(`${indentStr}  <ol>`);
      }
    }

    // Add files in this directory
    for (const fileNode of filesInDir) {
      const fileName = path.basename(fileNode.path);

      let fileClass = 'file';
      if (fileNode.dependencies.length === 0 && fileNode.dependents.length > 0) {
        fileClass = 'file leaf';
      } else if (fileNode.dependents.length === 0 && fileNode.dependencies.length > 0) {
        fileClass = 'file entry-point';
      }

      const folderPath = normalizePath(fileNode.parent || graph.rootDir);
      htmlParts.push(
        `${indentStr}${dirNode.path === graph.rootDir ? '' : '  '}<li class="${fileClass}" data-file-path="${escapeHtml(normalizePath(fileNode.path))}" data-folder="${escapeHtml(folderPath)}"><span>${escapeHtml(fileName)}</span></li>`
      );
    }

    // Add child directories
    for (const child of dirNode.children) {
      generateDirHtml(child, dirNode.path === graph.rootDir ? indent : indent + 1);
    }

    // Close directory ol and li
    if (dirNode.path !== graph.rootDir) {
      if (filesInDir.length > 0 || dirNode.children.length > 0) {
        htmlParts.push(`${indentStr}  </ol>`);
      }
      htmlParts.push(`${indentStr}</li>`);
    }
  }

  generateDirHtml(dirTree);
  return htmlParts.join('\n');
}

interface DirNode {
  path: string;
  name: string;
  children: DirNode[];
  files: string[];
}

/**
 * Build a tree structure of directories
 */
function buildDirectoryTree(dirPaths: string[], rootDir: string): DirNode {
  const root: DirNode = {
    path: rootDir,
    name: path.basename(rootDir) || 'root',
    children: [],
    files: []
  };

  const nodeMap = new Map<string, DirNode>();
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
      const node: DirNode = {
        path: dirPath,
        name: path.basename(dirPath),
        children: [],
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

function readTemplateFileContent(templateFileName: string): string {
  const filePath = path.resolve(__dirname, 'htmlTemplates', templateFileName);
  return fs.readFileSync(filePath, 'utf8');
}
