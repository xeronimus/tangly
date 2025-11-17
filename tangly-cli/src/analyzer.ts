import {AnalyzerOptions} from './types';
import {buildProjectGraph} from './graph';
import {formatAsJson} from './formatters/json';
import {formatAsDot} from './formatters/dot';
import {formatAsDotHierarchy} from './formatters/dotHierarchy';
import {formatAsTree} from './formatters/tree';
import {formatAsHtml} from './formatters/html';

/**
 * Main analyzer function
 */
export async function analyzeProject(options: AnalyzerOptions): Promise<string> {
  const {rootDir, format, includeExternal = false, excludePatterns} = options;

  // Build the dependency graph
  const graph = buildProjectGraph(rootDir, includeExternal, excludePatterns);

  // Format the output based on the requested format
  switch (format) {
    case 'json':
      return formatAsJson(graph);
    case 'dot':
      return formatAsDot(graph);
    case 'dot-hierarchy':
      return formatAsDotHierarchy(graph);
    case 'tree':
      return formatAsTree(graph);
    case 'html':
      return formatAsHtml(graph, options);
    default:
      throw new Error(`Unknown format: ${format}`);
  }
}
