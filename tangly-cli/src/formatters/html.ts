import { ProjectGraph, AnalyzerOptions } from '../types';
import {formatAsJson} from './json';
import * as fs from 'fs-extra';
import * as path from 'path';

/**
 * Format project graph as interactive HTML with tree view and SVG dependency lines
 *
 */
export function formatAsHtml(graph: ProjectGraph, options: AnalyzerOptions): string {
  // Step 1: Run the JSON formatter with the given projectGraph
  const jsonData = formatAsJson(graph);

  // Step 2: Read index.html from ../tangly-viewer/dist
  // __dirname will be in dist/formatters, so we need to go up 3 levels to reach the tangly root
  const viewerDistPath = path.join(__dirname, '../../../tangly-viewer/dist');
  const indexHtmlPath = path.join(viewerDistPath, 'index.html');

  if (!fs.existsSync(viewerDistPath)) {
    throw new Error(`tangly-viewer dist folder not found at ${viewerDistPath}. Please build tangly-viewer first.`);
  }

  if (!fs.existsSync(indexHtmlPath)) {
    throw new Error(`index.html not found at ${indexHtmlPath}. Please build tangly-viewer first.`);
  }

  let htmlTemplate = fs.readFileSync(indexHtmlPath, 'utf-8');

  // Step 3: Fix asset paths to be relative instead of absolute
  htmlTemplate = htmlTemplate.replace(/src="\/assets\//g, 'src="./assets/');
  htmlTemplate = htmlTemplate.replace(/href="\/assets\//g, 'href="./assets/');

  // Step 3 continued: Add a script tag to inject the data
  const dataScript = `<script>window.TANGLY_DATA = ${jsonData};</script>`;
  const modifiedHtml = htmlTemplate.replace('</head>', `  ${dataScript}\n  </head>`);

  // Step 4: Write the modified HTML to the target directory
  if (!options.output) {
    throw new Error('Output path is required for HTML format');
  }

  const targetDir = path.dirname(options.output);

  // Create target directory if it doesn't exist
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const outputHtmlPath = path.join(targetDir, 'index.html');
  fs.writeFileSync(outputHtmlPath, modifiedHtml, 'utf-8');

  // Step 5: Copy the assets folder to the target directory
  const assetsSourcePath = path.join(viewerDistPath, 'assets');
  const assetsTargetPath = path.join(targetDir, 'assets');

  if (fs.existsSync(assetsSourcePath)) {
    // Copy assets folder recursively (fs-extra will overwrite if exists)
    fs.copySync(assetsSourcePath, assetsTargetPath, { overwrite: true });
  }

  // Step 6: Return success message
  return `HTML viewer written to ${outputHtmlPath}\nAssets copied to ${assetsTargetPath}\n\nTo view:\n- Open ${outputHtmlPath} directly in a browser (may have CORS issues)\n- OR run a local server: npx serve ${targetDir}`;
}

