import {ProjectGraph} from '../types';
import {formatAsJson} from '../formatters/json';
import * as fs from 'fs-extra';
import * as path from 'path';

/**
 * Export project graph as interactive HTML viewer
 * This is NOT a formatter - it writes multiple files to disk
 *
 * @param graph - The project graph to export
 * @param targetDir - Where to write the HTML file and assets
 */
export function exportAsHtml(graph: ProjectGraph, targetDir: string): void {
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

  // Step 4: Add a script tag to inject the data
  const dataScript = `<script>window.TANGLY_DATA = ${jsonData};</script>`;
  const modifiedHtml = htmlTemplate.replace('</head>', `  ${dataScript}\n  </head>`);

  // Step 5: Write the modified HTML to the target directory

  // Create target directory if it doesn't exist
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, {recursive: true});
  }

  const outputHtmlPath = path.join(targetDir, 'index.html');
  fs.writeFileSync(outputHtmlPath, modifiedHtml, 'utf-8');

  // Step 6: Copy the assets folder to the target directory
  const assetsSourcePath = path.join(viewerDistPath, 'assets');
  const assetsTargetPath = path.join(targetDir, 'assets');

  if (fs.existsSync(assetsSourcePath)) {
    // Copy assets folder recursively (fs-extra will overwrite if exists)
    fs.copySync(assetsSourcePath, assetsTargetPath, {overwrite: true});
  }

  console.log(`HTML viewer written to ${outputHtmlPath}`);
  console.log(`Assets copied to ${assetsTargetPath}`);
  console.log(`\nTo view:`);
  console.log(`- run a local server: npx serve ${targetDir}`);
}
