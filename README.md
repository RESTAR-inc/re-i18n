# Re-i18n

A tool to manage i18n by extracting keys from source code and generating locale files.

## Configuration

Create a `re-i18n.config.json` file in the root of your project. Follow the example below to configure it. Refer to the `./src/schemas/config.ts` file for details.

```json
{
  "appType": "vue",
  "pattern": "src/{app,lib}/**/*.{ts,vue}",
  "langs": ["ja", "en"],
  "json": {
    "outDir": "./out/json"
  },
  "csv": {
    "outDir": "./out/csv",
    "inputDir": "./out/csv",
    "delimiter": ";"
  },
  "xls": {
    "outDir": "./out/xls",
    "inputDir": "./out/xls"
  },
  "generate": {
    "getLangPath": "./src/i18n/getLang",
    "formatterPath": "./src/i18n/formatter"
  }
}
```

## Usage

This package provides the CLI command `re-i18n`. Run it in the root of your project.

```sh
re-i18n --help
```

### Supported commands

#### generate

Generates locale files from source code. Uses the `pattern` and `appType` parameters defined in the configuration file to parse the source code, read the i18n keys, generate the i18n files, and write them to the `dirName` directory. It also uses the `getLang` and `formatter` functions defined in the config file to generate the main module in each locale directory.

#### export-json

Creates a JSON file from the source code and the i18n keys found. This is essentially an AST representation of the code used to generate i18n files. It is not intended for direct use.

#### export-csv

For each language, a CSV file is created from the source code and the i18n keys found.

#### export-xls

Creates an XLS file from the source code and the i18n keys found.

#### import-csv

For each locale, it will read the CSV file and overwrite the i18n files with the new values.

#### import-xls

Reads the XLS file and overwrites the i18n files with the new values.
