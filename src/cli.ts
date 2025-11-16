#!/usr/bin/env node

import {Command} from 'commander';
import * as path from 'path';
import * as fs from 'fs';
import {analyzeProject} from './analyzer';
import {OutputFormat} from './types';

const program = new Command();

program
  .name('spidernet')
  .description('Build dependency graphs for TypeScript/React projects')
  .version('1.0.0')
  .argument('<directory>', 'Path to the project directory to analyze')
  .option('-f, --format <format>', 'Output format: json, dot, or tree', 'json')
  .option('-o, --output <file>', 'Output file (defaults to stdout)')
  .option('--include-external', 'Include external dependencies (node_modules, etc.)', false)
  .action(async (directory: string, options: {format: string; output?: string; includeExternal: boolean}) => {
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

      // Validate format
      const format = options.format.toLowerCase() as OutputFormat;
      if (!['json', 'dot', 'tree'].includes(format)) {
        console.error(`Error: Invalid format "${options.format}". Must be one of: json, dot, tree`);
        process.exit(1);
      }

      // Run the analyzer
      const result = await analyzeProject({
        rootDir,
        format,
        output: options.output,
        includeExternal: options.includeExternal
      });

      // Output the result
      if (options.output) {
        fs.writeFileSync(options.output, result);
        console.log(`Dependency graph written to ${options.output}`);
      } else {
        console.log(result);
      }
    } catch (error) {
      console.error('Error analyzing project:', error);
      process.exit(1);
    }
  });

program.parse();
