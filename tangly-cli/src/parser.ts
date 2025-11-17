import * as ts from 'typescript';
import * as path from 'path';
import * as fs from 'fs';
import {ImportDetail, ImportType} from './types';

export interface ParsedImport {
  /** Module specifier (e.g., './utils', 'react') */
  moduleSpecifier: string;
  /** Resolved absolute path (for local imports) */
  resolvedPath?: string;
  /** Import details */
  details: ImportDetail;
}

/**
 * Parse all imports from a TypeScript file
 */
export function parseImports(filePath: string): ParsedImport[] {
  const sourceCode = fs.readFileSync(filePath, 'utf-8');
  const sourceFile = ts.createSourceFile(filePath, sourceCode, ts.ScriptTarget.Latest, true);

  const imports: ParsedImport[] = [];

  function visit(node: ts.Node): void {
    // Handle import declarations: import { foo } from 'bar'
    if (ts.isImportDeclaration(node)) {
      const moduleSpecifier = (node.moduleSpecifier as ts.StringLiteral).text;
      const importClause = node.importClause;

      if (!importClause) {
        // Side-effect import: import 'module'
        imports.push({
          moduleSpecifier,
          resolvedPath: resolveImportPath(moduleSpecifier, filePath),
          details: {
            names: [],
            type: 'side-effect',
            isTypeOnly: false
          }
        });
        return;
      }

      const isTypeOnly = importClause.isTypeOnly;
      const names: string[] = [];
      let importType: ImportType = 'named';

      // Default import: import Foo from 'bar'
      if (importClause.name) {
        names.push(importClause.name.text);
        importType = 'default';
      }

      // Named bindings: import { foo, bar } from 'baz' or import * as foo from 'bar'
      if (importClause.namedBindings) {
        if (ts.isNamespaceImport(importClause.namedBindings)) {
          // Namespace import: import * as foo from 'bar'
          names.push(importClause.namedBindings.name.text);
          importType = 'namespace';
        } else if (ts.isNamedImports(importClause.namedBindings)) {
          // Named imports: import { foo, bar } from 'baz'
          for (const element of importClause.namedBindings.elements) {
            names.push(element.name.text);
          }
          // If there's also a default import, type is default, otherwise named
          if (importType !== 'default') {
            importType = isTypeOnly ? 'type' : 'named';
          }
        }
      }

      imports.push({
        moduleSpecifier,
        resolvedPath: resolveImportPath(moduleSpecifier, filePath),
        details: {
          names,
          type: importType,
          isTypeOnly
        }
      });
    }

    // Handle export declarations that import: export { foo } from 'bar'
    if (ts.isExportDeclaration(node) && node.moduleSpecifier) {
      const moduleSpecifier = (node.moduleSpecifier as ts.StringLiteral).text;
      const names: string[] = [];
      const isTypeOnly = node.isTypeOnly;

      if (node.exportClause && ts.isNamedExports(node.exportClause)) {
        for (const element of node.exportClause.elements) {
          names.push(element.name.text);
        }
      }

      imports.push({
        moduleSpecifier,
        resolvedPath: resolveImportPath(moduleSpecifier, filePath),
        details: {
          names,
          type: isTypeOnly ? 'type' : 'named',
          isTypeOnly
        }
      });
    }

    // Handle dynamic imports: import('module')
    if (ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword) {
      if (node.arguments.length > 0 && ts.isStringLiteral(node.arguments[0])) {
        const moduleSpecifier = node.arguments[0].text;
        imports.push({
          moduleSpecifier,
          resolvedPath: resolveImportPath(moduleSpecifier, filePath),
          details: {
            names: [],
            type: 'namespace',
            isTypeOnly: false
          }
        });
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return imports;
}

/**
 * Resolve import path to absolute file path
 */
function resolveImportPath(moduleSpecifier: string, fromFile: string): string | undefined {
  // Skip external modules (those that don't start with . or /)
  if (!moduleSpecifier.startsWith('.') && !moduleSpecifier.startsWith('/')) {
    return undefined;
  }

  const fromDir = path.dirname(fromFile);
  let resolvedPath = path.resolve(fromDir, moduleSpecifier);

  // Try to resolve with common extensions
  const extensions = ['.ts', '.tsx', '.d.ts', '/index.ts', '/index.tsx'];

  // First, check if the path as-is exists
  if (fs.existsSync(resolvedPath) && fs.statSync(resolvedPath).isFile()) {
    return resolvedPath;
  }

  // Try adding extensions
  for (const ext of extensions) {
    const pathWithExt = resolvedPath + ext;
    if (fs.existsSync(pathWithExt) && fs.statSync(pathWithExt).isFile()) {
      return pathWithExt;
    }
  }

  // If it's a directory, try index files
  if (fs.existsSync(resolvedPath) && fs.statSync(resolvedPath).isDirectory()) {
    for (const indexFile of ['index.ts', 'index.tsx']) {
      const indexPath = path.join(resolvedPath, indexFile);
      if (fs.existsSync(indexPath)) {
        return indexPath;
      }
    }
  }

  return undefined;
}
