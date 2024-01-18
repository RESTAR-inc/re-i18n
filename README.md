# Re-i18n

A tool to manage i18n by extracting keys from source code and generating locale files.

## Usage

### Locale Locator

Create a module that exports a function that returns the current locale. This function will be used to determine the locale of generated files. The path to this module must be specified in the `generate.localeLocatorPath` parameter of the configuration file. Depending on the configuration of your project (`appType` parameter), the implementation of the function will be different (for example, a Vue project may need to use reactivity, while a vanilla project may need to return a simple string).

```ts
import type { UseLocaleLocator } from "re-i18n/lib/vendor/vue";
import { computed, ref } from "vue";

type Locale = "ja" | "en";

const innerLocale = ref<Locale>("ja");

const useLocaleLocator: UseLocaleLocator<Locale> = (locales, defaultLocale) => {
  return computed({
    get: () => innerLocale.value,
    set: (value) => {
      if (locales.includes(value)) {
        innerLocale.value = value;
      } else {
        innerLocale.value = defaultLocale;
      }
    },
  });
};

export default useLocaleLocator;
```

### Formatter (optional)

If you need to format translations, create a module that exports a function that takes a key and a value as parameters and returns a formatted string. The path to this module must be specified in the `generate.formatterPath` parameter of the configuration file.

```ts
import formatString from "my-amazing-formatter-lib"; // just an example
import type { I18nFormatter } from "re-i18n";

type Locale = "ja" | "en";

const fmt: I18nFormatter<Locale> = (locale, str, opts) => {
  return formatString(str, opts, locale);
};
export default fmt;
```

### Configuration

Create a `re-i18n.config.json` file in the root of your project. Follow the example below to configure it. Refer to the `./src/schemas/config.ts` file for details.

```json
{
  "defaultLocale": "ja",
  "locales": ["ja", "en"],
  "appType": "vue",
  "pattern": "src/{app,lib}/**/*.{ts,vue}",
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
    "localeLocatorPath": "./src/i18n/useLocateLocator",
    "formatterPath": "./src/i18n/formatter"
  }
}
```

### Translation Keys

After following the previous steps, you can use the `t` function to define translation keys in your source code. You can use a different name for the function by setting the `funcName` parameter in the configuration file.

Let's suppose you have the following code:

```ts
// src/lib/myAwesomeModule.ts

function sayHello(name: string) {
  return `こんにちわ${name}さん`;
}

// src/lib/MyAwesomeComponent.vue
<script setup lang="ts">
const props = defineProps({
  name: String,
});

const showAlert = () => alert(`おはようございます${name}さん`);
</script>

<template>
  <button @click="showAlert">こんばんは</button>
</template>
```

Set the keys as follows:

```ts
// src/MyAwesomeModule/hello.ts

function sayHello(name: string) {
  return t("こんにちわ{name}さん", { name });
}

// src/MyAwesomeModule/Component.vue
<script setup lang="ts">
const props = defineProps({
  name: String,
});

const showAlert = () => alert(
  t("おはようございます{name}さん", { name: props.name })
);
</script>

<template>
  <button @click=showAlert>{{ t("こんばんは") }}</button>
</template>
```

Next step is to run comman `re-i18n generate`. This will generate locale files in the `out` directory.

```
src/MyAwesomeModule
├── Component.vue
├── hello.ts
└── locales
    ├── en.json
    ├── index.ts
    └── ja.json
```

```json
// src/MyAwesomeModule/locales/en.json
{
  "おはようございます{name}さん": "",
  "こんにちわ{name}さん": "",
  "こんばんは": ""
}

// src/MyAwesomeModule/locales/ja.json
{
  "おはようございます{name}さん": "",
  "こんにちわ{name}さん": "",
  "こんばんは": ""
}

```

Next step is to import `t` function from `locale` folder:

```ts
// src/MyAwesomeModule/hello.ts
import { t } from "./locales";
...

// src/MyAwesomeModule/Component.ts
<script setup lang="ts">
import { t } from "./locales";
...
</script>
```

Now you can put the translations in the locale files.

For more details, see the [example](./example) directory.

## Commands

Depending on your project configuration (`funcName` param),

This package provides the CLI command `re-i18n`. Run it in the root of your project.

```sh
re-i18n --help
```

#### generate

Generates locale files from source code. Uses the `pattern` and `appType` parameters defined in the configuration file to parse the source code, read the i18n keys, generate the i18n files, and write them to the `dirName` directory. It also uses the `generator.localeLocatorPath` and `generator.formatterPath` functions defined in the config file to generate the main module in each locale directory.

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

#### stats

Displays statistics on the number of keys in each locale.
