import * as fs from 'fs';
import * as path from 'path';
import {ConfigFile, OutputFormat} from './types';

/**
 * Read and validate a config file
 */
export function readConfigFile(configPath: string): ConfigFile {
  // Resolve the config file path
  const resolvedPath = path.resolve(configPath);

  // Check if file exists
  if (!fs.existsSync(resolvedPath)) {
    throw new Error(`Config file not found: ${resolvedPath}`);
  }

  // Read and parse the config file
  let config: any;
  try {
    const content = fs.readFileSync(resolvedPath, 'utf-8');
    config = JSON.parse(content);
  } catch (error) {
    throw new Error(`Failed to parse config file: ${(error as Error).message}`);
  }

  // Validate the config
  const validatedConfig: ConfigFile = {};

  // Validate format
  if (config.format !== undefined) {
    if (!['json', 'dot', 'tree'].includes(config.format)) {
      throw new Error(`Invalid format in config file: "${config.format}". Must be one of: json, dot, tree`);
    }
    validatedConfig.format = config.format as OutputFormat;
  }

  // Validate output
  if (config.output !== undefined) {
    if (typeof config.output !== 'string') {
      throw new Error(`Invalid output in config file: must be a string`);
    }
    validatedConfig.output = config.output;
  }

  // Validate includeExternal
  if (config.includeExternal !== undefined) {
    if (typeof config.includeExternal !== 'boolean') {
      throw new Error(`Invalid includeExternal in config file: must be a boolean`);
    }
    validatedConfig.includeExternal = config.includeExternal;
  }

  return validatedConfig;
}

/**
 * Merge CLI options with config file options
 * CLI options take precedence over config file options
 */
export function mergeOptions(
  cliOptions: {
    format?: string;
    output?: string;
    includeExternal?: boolean;
  },
  configOptions: ConfigFile
): {
  format: OutputFormat;
  output?: string;
  includeExternal: boolean;
} {
  return {
    format: (cliOptions.format as OutputFormat) || configOptions.format || 'json',
    output: cliOptions.output || configOptions.output,
    includeExternal: cliOptions.includeExternal ?? configOptions.includeExternal ?? false
  };
}
