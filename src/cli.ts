#!/usr/bin/env node

import {Command} from 'commander';
import * as path from 'path';
import * as fs from 'fs';
import {analyzeProject} from './analyzer';
import {OutputFormat, ConfigFile} from './types';
import {readConfigFile, mergeOptions} from './config';

const program = new Command();

program
  .name('spidernet')
  .description('Build dependency graphs for TypeScript/React projects')
  .version('1.0.0')
  .argument('<directory>', 'Path to the project directory to analyze')
  .option('-c, --config <file>', 'Config file path (e.g., snconfig.json)')
  .option('-f, --format <format>', 'Output format: json, dot, or tree')
  .option('-o, --output <file>', 'Output file (defaults to stdout)')
  .option('--include-external', 'Include external dependencies (node_modules, etc.)')
  .action(
    async (
      directory: string,
      options: {config?: string; format?: string; output?: string; includeExternal?: boolean}
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
        if (!['json', 'dot', 'tree'].includes(format)) {
          console.error(`Error: Invalid format "${format}". Must be one of: json, dot, tree`);
          process.exit(1);
        }

        // Run the analyzer
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
          fs.writeFileSync(mergedOptions.output, result);
          console.log(`Dependency graph written to ${mergedOptions.output}`);
        } else {
          console.log(result);
        }
      } catch (error) {
        console.error('Error analyzing project:', error);
        process.exit(1);
      }
    }
  );

program.parse();
