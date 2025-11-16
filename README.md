# 🧶 Tangly

**Untangle your TypeScript/React project dependencies**

Tangly is a powerful CLI tool that analyzes TypeScript and React projects to build comprehensive project graphs. It tracks both import dependencies and file system hierarchy, helping you understand and visualize the structure of your codebase.

## ✨ Features

- 📊 **Dual Graph Analysis**: Tracks both import dependencies and file system hierarchy
- 🎨 **Multiple Output Formats**: JSON, DOT (Graphviz), and interactive tree view
- 🔍 **Deep Import Analysis**: Distinguishes between default, named, namespace, and type-only imports
- 🚫 **Flexible Filtering**: Exclude files using regex patterns
- 🔄 **Circular Dependency Detection**: Automatically identifies dependency cycles
- 📈 **Statistics**: Get insights into your project's complexity

## 📦 Installation

```bash
npm install -g tangly
```

Or use it directly with npx:

```bash
npx tangly <directory>
```

## 🚀 Quick Start

Analyze your project with a simple command:

```bash
tangly ./src
```

This will output a JSON representation of your project's dependency graph.

### Tree View

Get a visual tree representation in your terminal:

```bash
tangly ./src --format tree
```

Output:

```
================================================================================
Dependency Graph for: C:/path/to/your/project/src
================================================================================

📊 Statistics:
  Total files: 42
  Total dependencies: 156
  Average dependencies per file: 3.71
  Max dependencies: 12
  Files with no dependencies: 5
  Files with no dependents: 3

  ✅: No circular dependencies detected!

--------------------------------------------------------------------------------

Entry Points (files with no dependents): 3
  index.ts (8 dependencies)
    ├── App.tsx [{default}]
    │   ├── components/Header.tsx [{Header}]
    │   ├── components/Footer.tsx [{Footer}]
    │   └── styles/App.css [side-effect]
    └── config.ts [{AppConfig}]
```

### Generate Graphviz Visualization

Create a visual graph diagram:

```bash
tangly ./src --format dot --output graph.dot
dot -Tpng graph.dot -o graph.png
```

## 📖 Usage

```
Usage: tangly [options] <directory>

Arguments:
  directory              Path to the project directory to analyze

Options:
  -V, --version          output the version number
  -c, --config <file>    Config file path (e.g., tangly.config.json)
  -f, --format <format>  Output format: json, dot, or tree (default: "json")
  -o, --output <file>    Output file (defaults to stdout)
  --include-external     Include external dependencies (node_modules, etc.)
  -h, --help             display help for command
```

## ⚙️ Configuration

Create a `tangly.config.json` file in your project root:

```json
{
  "format": "tree",
  "output": "dependency-graph.txt",
  "includeExternal": false,
  "exclude": [".*\\.test\\.ts$", ".*\\.spec\\.tsx$", ".*/testResources/.*"]
}
```

Then run:

```bash
tangly ./src --config tangly.config.json
```

### Configuration Options

| Option            | Type                 | Description                             |
| ----------------- | -------------------- | --------------------------------------- |
| `format`          | `string`             | Output format: `json`, `dot`, or `tree` |
| `output`          | `string`             | Output file path (omit for stdout)      |
| `includeExternal` | `boolean`            | Include dependencies from node_modules  |
| `exclude`         | `string \| string[]` | Regex pattern(s) to exclude files       |

### Exclude Patterns

Exclude files using regex patterns:

```json
{
  "exclude": [
    ".*\\.test\\.ts$", // Exclude all test files
    ".*\\.spec\\.tsx$", // Exclude all spec files
    ".*/legacy/.*", // Exclude legacy directory
    ".*/generated/.*" // Exclude generated code
  ]
}
```

**Note**: Patterns use forward slashes (`/`) for cross-platform compatibility, even on Windows.

## 📊 Output Formats

### JSON Format

Structured data perfect for programmatic analysis:

```json
{
  "metadata": {
    "rootDir": "C:/path/to/project/src",
    "totalFiles": 42,
    "totalEdges": 156,
    "averageDependencies": 3.71,
    "circularDependencies": []
  },
  "nodes": [
    {
      "path": "C:/path/to/project/src/App.tsx",
      "relativePath": "App.tsx",
      "dependencies": ["C:/path/to/project/src/components/Header.tsx"],
      "dependents": ["C:/path/to/project/src/index.ts"],
      "parent": "C:/path/to/project/src"
    }
  ],
  "importEdges": [
    {
      "from": "C:/path/to/project/src/App.tsx",
      "to": "C:/path/to/project/src/components/Header.tsx",
      "imports": [
        {
          "names": ["Header"],
          "type": "named",
          "isTypeOnly": false
        }
      ]
    }
  ],
  "hierarchyEdges": [
    {
      "parent": "C:/path/to/project/src",
      "child": "C:/path/to/project/src/App.tsx"
    }
  ]
}
```

### DOT Format (Graphviz)

Generate visual graphs with Graphviz:

```bash
tangly ./src --format dot --output graph.dot
```

Features:

- Color-coded nodes (entry points, leaf files, isolated files)
- Import details on edges
- Type-only imports shown in blue
- Side-effect imports shown as dashed lines

### Tree Format

Human-readable console output with:

- 📊 Project statistics
- 🔍 Circular dependency warnings
- 📂 Entry points with dependency trees
- 🍃 Leaf files (files with no dependencies)
- 🏝️ Isolated files

## 🎯 Use Cases

### Find Circular Dependencies

```bash
tangly ./src --format tree | grep -A 10 "Circular"
```

### Analyze Import Patterns

```bash
tangly ./src --format json > analysis.json
# Process with jq, custom scripts, etc.
```

### Generate Documentation

```bash
tangly ./src --format dot --output docs/architecture.dot
dot -Tsvg docs/architecture.dot -o docs/architecture.svg
```

### Find Unused Files

Look for files with no dependents (might be dead code):

```bash
tangly ./src --format tree | grep -A 50 "Isolated Files"
```

### Audit Dependencies

```bash
# Include external dependencies to see what's imported from node_modules
tangly ./src --include-external --format json > full-deps.json
```

## 📐 Graph Structure

Tangly builds a **ProjectGraph** with two types of edges:

### Import Edges

Represent code dependencies (file A imports from file B):

- Tracks all import types: default, named, namespace, type-only, side-effect
- Captures imported symbol names
- Distinguishes type-only imports

### Hierarchy Edges

Represent file system structure (file belongs to directory):

- Maps parent directories to child files
- Enables project structure analysis

## 🔧 Advanced Examples

### Custom Analysis Script

```javascript
const fs = require('fs');
const {execSync} = require('child_process');

// Generate JSON
execSync('tangly ./src --format json --output graph.json');

// Parse and analyze
const graph = JSON.parse(fs.readFileSync('graph.json'));

// Find files with most dependencies
const topFiles = graph.nodes.sort((a, b) => b.dependencies.length - a.dependencies.length).slice(0, 10);

console.log('Top 10 files with most dependencies:');
topFiles.forEach((file) => {
  console.log(`${file.relativePath}: ${file.dependencies.length} deps`);
});
```

### Integration with Build Tools

```json
// package.json
{
  "scripts": {
    "analyze": "tangly ./src --config tangly.config.json",
    "analyze:visual": "tangly ./src -f dot -o graph.dot && dot -Tpng graph.dot -o graph.png",
    "analyze:check": "tangly ./src -f tree | grep -q 'circular dependencies detected' && exit 1 || exit 0"
  }
}
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## 📝 License

ISC

## 🙏 Acknowledgments

Built with:

- [Commander.js](https://github.com/tj/commander.js/) - CLI framework
- [TypeScript Compiler API](https://github.com/microsoft/TypeScript) - Import parsing
- Love for clean, understandable code 🧶

---

**Made with ❤️ to help developers untangle their code**
