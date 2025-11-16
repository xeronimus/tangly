import {AnalyzerOptions} from './types';
import {buildDependencyGraph} from './graph';
import {formatAsJson} from './formatters/json';
import {formatAsDot} from './formatters/dot';
import {formatAsTree} from './formatters/tree';

/**
 * Main analyzer function
 */
export async function analyzeProject(options: AnalyzerOptions): Promise<string> {
  const {rootDir, format, includeExternal = false} = options;

  // Build the dependency graph
  const graph = buildDependencyGraph(rootDir, includeExternal);

  // Format the output based on the requested format
  switch (format) {
    case 'json':
      return formatAsJson(graph);
    case 'dot':
      return formatAsDot(graph);
    case 'tree':
      return formatAsTree(graph);
    default:
      throw new Error(`Unknown format: ${format}`);
  }
}
