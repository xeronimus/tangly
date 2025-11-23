#!/usr/bin/env node

import {Command} from 'commander';
import * as path from 'path';
import * as fs from 'fs';
import * as chokidar from 'chokidar';
import {OutputFormat, ConfigFile} from './internalTypes';
import {readConfigFile, mergeOptions} from './config';
import {buildProjectGraph} from './graph';
import {formatAsJson} from './formatters/json';
import {formatAsDot} from './formatters/dot';
import {formatAsTree} from './formatters/tree';
import {exportAsHtml} from './exporters/html';
import packageJson from '../package.json';

const program = new Command();

program
  .name('tangly')
  .description('Untangle your TypeScript/React project dependencies')
  .version(packageJson.version, '-v, --version', 'Output the version number')
  .argument('<directory>', 'Path to the project directory to analyze')
  .option('-c, --config <file>', 'Config file path (e.g., tangly.config.json)')
  .option('-f, --format <format>', 'Output format: json, dot, tree')
  .option('-o, --output <file>', 'Output file (defaults to stdout)')
  .option('-a, --app <directory>', 'Use tangly-viewer. Specify a directory')
  .option('--include-external', 'Include external dependencies (node_modules, etc.)')
  .option('-w, --watch', 'Watch for file changes and regenerate automatically')
  .action(
    async (
      directory: string,
      options: {
        config?: string;
        format?: string;
        output?: string;
        app?: string;
        includeExternal?: boolean;
        watch?: boolean;
      }
    ) => {
      try {
        // Resolve the directory path
        const rootDir = path.resolve(directory);

        // Check if directory exists
        if (!fs.existsSync(rootDir)) {
          console.error(`Error: Directory "${rootDir}" does not exist`);
          process.exit(1);
        }

        if (!fs.statSync(rootDir).isDirectory()) {
          console.error(`Error: "${rootDir}" is not a directory`);
          process.exit(1);
        }

        // Read config file if provided
        let configFileOptions: ConfigFile = {};
        if (options.config) {
          try {
            configFileOptions = readConfigFile(options.config);
          } catch (error) {
            console.error('Error reading config file:', (error as Error).message);
            process.exit(1);
          }
        }

        // Merge CLI options with config file options (CLI takes precedence)
        const mergedOptions = mergeOptions(
          {
            format: options.format,
            output: options.output,
            includeExternal: options.includeExternal,
            app: options.app
          },
          configFileOptions
        );

        // Validate format
        const format = mergedOptions.format.toLowerCase() as OutputFormat;
        if (!['json', 'dot', 'tree'].includes(format)) {
          console.error(`Error: Invalid format "${format}". Must be one of: json, dot, tree`);
          process.exit(1);
        }

        // Function to run analysis
        const runAnalysis = async () => {
          try {
            // Build the dependency graph
            const excludePatterns =
              typeof mergedOptions.excludePatterns === 'string'
                ? [mergedOptions.excludePatterns]
                : mergedOptions.excludePatterns;
            const graph = buildProjectGraph(rootDir, mergedOptions.includeExternal, excludePatterns);

            if (mergedOptions.app) {
              if (mergedOptions.output || mergedOptions.format) {
                console.warn(`Using the tangly-viewer app. Ignoring -f (format) and -o (output)`);
              }
              exportAsHtml(graph, mergedOptions.app);
            } else {
              // format the graph according to "format" option
              let result = '';
              switch (format) {
                case 'json':
                  result = formatAsJson(graph);
                  break;
                case 'dot':
                  result = formatAsDot(graph);
                  break;
                case 'tree':
                  result = formatAsTree(graph);
                  break;
                default:
                  throw new Error(`Unknown format: ${format}`);
              }

              if (mergedOptions.output) {
                // Ensure output directory exists
                const outputDir = path.dirname(mergedOptions.output);
                if (!fs.existsSync(outputDir)) {
                  fs.mkdirSync(outputDir, {recursive: true});
                }

                fs.writeFileSync(mergedOptions.output, result);
                const timestamp = new Date().toLocaleTimeString();
                console.log(`[${timestamp}] Dependency graph written to ${mergedOptions.output}`);
              } else {
                console.log(result);
              }
            }
          } catch (error) {
            console.error('Error analyzing project:', error);
            if (!options.watch) {
              process.exit(1);
            }
          }
        };

        // Run initial analysis
        await runAnalysis();

        // If watch mode is enabled, set up file watcher
        if (options.watch) {
          console.log(`\n👀  Watching for changes in ${rootDir}...`);
          console.log('Press Ctrl+C to stop\n');

          // Debounce timer
          let debounceTimer: NodeJS.Timeout | null = null;
          const debounceDelay = 300; // ms

          const watcher = chokidar.watch(rootDir, {
            ignored: [
              '**/node_modules/**',
              '**/.git/**',
              '**/dist/**',
              '**/build/**',
              mergedOptions.output ? path.resolve(mergedOptions.output) : null
            ].filter(Boolean) as string[],
            persistent: true,
            ignoreInitial: true
          });

          watcher.on('all', (event, changedPath) => {
            // Only react to TypeScript/JavaScript files
            if (!/\.(ts|tsx|js|jsx)$/.test(changedPath)) {
              return;
            }

            // Debounce: clear existing timer and set a new one
            if (debounceTimer) {
              clearTimeout(debounceTimer);
            }

            debounceTimer = setTimeout(async () => {
              const timestamp = new Date().toLocaleTimeString();
              console.log(`\n[${timestamp}] File ${event}: ${path.relative(rootDir, changedPath)}`);
              console.log('Regenerating...');
              await runAnalysis();
            }, debounceDelay);
          });

          // Handle graceful shutdown
          process.on('SIGINT', () => {
            console.log('\n\nStopping watcher...');
            watcher.close();
            process.exit(0);
          });
        }
      } catch (error) {
        console.error('Error analyzing project:', error);
        process.exit(1);
      }
    }
  );

program.parse();
