#!/usr/bin/env node

import {Command} from 'commander';
import * as path from 'path';
import * as fs from 'fs';
import * as chokidar from 'chokidar';
import {analyzeProject} from './analyzer';
import {OutputFormat, ConfigFile} from './types';
import {readConfigFile, mergeOptions} from './config';

const program = new Command();

program
  .name('tangly')
  .description('Untangle your TypeScript/React project dependencies')
  .version('1.0.0')
  .argument('<directory>', 'Path to the project directory to analyze')
  .option('-c, --config <file>', 'Config file path (e.g., tangly.config.json)')
  .option('-f, --format <format>', 'Output format: json, dot, dot-hierarchy, tree, or html')
  .option('-o, --output <file>', 'Output file (defaults to stdout)')
  .option('--include-external', 'Include external dependencies (node_modules, etc.)')
  .option('-w, --watch', 'Watch for file changes and regenerate automatically')
  .action(
    async (
      directory: string,
      options: {config?: string; format?: string; output?: string; includeExternal?: boolean; watch?: boolean}
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
            includeExternal: options.includeExternal
          },
          configFileOptions
        );

        // Validate format
        const format = mergedOptions.format.toLowerCase() as OutputFormat;
        if (!['json', 'dot', 'dot-hierarchy', 'tree', 'html'].includes(format)) {
          console.error(`Error: Invalid format "${format}". Must be one of: json, dot, dot-hierarchy, tree, html`);
          process.exit(1);
        }

        // Function to run analysis
        const runAnalysis = async () => {
          try {
            const result = await analyzeProject({
              rootDir,
              format,
              output: mergedOptions.output,
              includeExternal: mergedOptions.includeExternal,
              excludePatterns:
                typeof mergedOptions.excludePatterns === 'string'
                  ? [mergedOptions.excludePatterns]
                  : mergedOptions.excludePatterns
            });

            // Output the result
            if (mergedOptions.output) {
              // Ensure output directory exists
              const outputDir = path.dirname(mergedOptions.output);
              if (!fs.existsSync(outputDir)) {
                fs.mkdirSync(outputDir, { recursive: true });
              }

              fs.writeFileSync(mergedOptions.output, result);
              const timestamp = new Date().toLocaleTimeString();
              console.log(`[${timestamp}] Dependency graph written to ${mergedOptions.output}`);
            } else {
              console.log(result);
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
