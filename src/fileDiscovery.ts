import * as fs from 'fs';
import * as path from 'path';

/**
 * Recursively find all .ts and .tsx files in a directory
 */
export function findTypeScriptFiles(
  rootDir: string,
  includeExternal: boolean = false,
  excludePatterns?: string[]
): string[] {
  const results: string[] = [];
  const excludedDirs = includeExternal
    ? ['node_modules/.', 'dist', 'build', 'coverage', '.git']
    : ['node_modules', 'dist', 'build', 'coverage', '.git'];

  // Compile regex patterns
  const excludeRegexes = excludePatterns?.map((pattern) => new RegExp(pattern)) || [];

  function traverse(currentPath: string): void {
    try {
      const stats = fs.statSync(currentPath);

      if (stats.isDirectory()) {
        const dirName = path.basename(currentPath);

        // Skip excluded directories
        if (
          excludedDirs.some((excluded) => {
            if (excluded.endsWith('/.')) {
              // Only exclude the root node_modules, not nested ones
              return dirName === excluded.slice(0, -2) && path.dirname(currentPath) === rootDir;
            }
            return dirName === excluded;
          })
        ) {
          return;
        }

        // Recursively traverse directory
        const entries = fs.readdirSync(currentPath);
        for (const entry of entries) {
          traverse(path.join(currentPath, entry));
        }
      } else if (stats.isFile()) {
        const ext = path.extname(currentPath);

        // Include .ts and .tsx files, but exclude .d.ts files
        if ((ext === '.ts' || ext === '.tsx') && !currentPath.endsWith('.d.ts')) {
          // Check if file matches any exclude pattern
          const relativePath = path.relative(rootDir, currentPath);
          // Normalize path to use forward slashes for cross-platform regex matching
          const normalizedPath = relativePath.replace(/\\/g, '/');
          const isExcluded = excludeRegexes.some((regex) => regex.test(normalizedPath));

          if (!isExcluded) {
            results.push(currentPath);
          }
        }
      }
    } catch (error) {
      // Skip files/directories that can't be accessed
      console.warn(`Warning: Cannot access ${currentPath}:`, (error as Error).message);
    }
  }

  traverse(rootDir);
  return results.sort();
}

/**
 * Get relative path from root directory
 */
export function getRelativePath(rootDir: string, filePath: string): string {
  return path.relative(rootDir, filePath);
}
