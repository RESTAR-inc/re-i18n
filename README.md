# Re-i18n

A tool to manage i18n by extracting keys from source code and generating locale files.

## Usage

### Locale Locator

Create a module that exports a function that returns the current locale. This function will be used to determine the locale of generated files. The path to this module must be specified in the `generate.localeLocatorPath` parameter of the configuration file. Depending on the configuration of your project (`appType` parameter), the implementation of the function will be different (for example, a Vue project may need to use reactivity, while a vanilla project may need to return a simple string).

```ts
import type { UseLocaleLocator } from "@restar-inc/re-i18n/lib/vendor/vue";
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
import type { I18nFormatter } from "@restar-inc/re-i18n";

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

const showAlert = () => alert(`おはようございます${props.name}さん`);
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

## Vendor Specific Features

### Vue Reactivity

By default, the translation function returns a string. If you want to use reactivity, you can use the composable function `useReI18n` or its shortcut `t.$`.

```json
// re-i18n.config.json
{
  "funcName": "t",
  "composableName": "useMyReI18n" // default `useReI18n`
}
```

```ts
// Component.vue
<script setup lang="ts">
import { t, useMyReI18n } from "./locales";

const MSG_1 = t("メッセージ　１"); // MSG_1 is `string`
const MSG_2 = t.$("メッセージ　２"); // MSG_2 is `ComputedRef<string>`
const MSG_3 = useMyReI18n("メッセージ　３"); // MSG_3 is `ComputedRef<string>`
</script>
```

> **NOTE**: `t.$` is just a shortcut for `useReI18n`, it works exactly the same way. A typical use in the `<script setup>` section is to use `t.$` in nested object fields:

```ts
// Instead of this
import { t, useMyReI18n } from "./locales";
const msg1 = useMyReI18n("メッセージ　１");
const msg2 = useMyReI18n("メッセージ　２");

const MESSAGES = {
  msg1,
  msg2,
};

// You can do this
const MESSAGES = {
  msg1: t.$("メッセージ　１"),
  msg2: t.$("メッセージ　２"),
};
```

> <span style="color: red">**IMPORTANT**: If you use `t.$` inside object fields, such as `const obj = { msg: t.$("message") }`, reactivity will work, but you will have to manually unwrap the value with `obj.msg.value`. This is not related to this package, but is a limitation of Vue.</span>

```ts
<script setup lang="ts">
import { t } from "./locales";

const MSG_1 = t.$("メッセージ　１");
const MSG_2 = {
  msg: t.$("メッセージ　２");
}
</script>
<template>
  <p>{{ MSG_1 }}</p><!-- メッセージ　１ -->
  <p>{{ MSG_2.msg }}</p><!-- "メッセージ　２" -->
  <p>{{ MSG_2.msg.value }}</p><!-- メッセージ　２ -->
</template>
```

### Vue Component

You can also use vendor specific features. For example, if you are using Vue, you can use the `ReI18n` component to display translation keys in source code and use VDOM nodes as parameters.

First you need to specify the component name in the configuration file.

```json
{
  "componentName": "MyI18n" // default `ReI18n`
}
```

Then you can use it in your source code.

```ts
<script setup lang="ts">
import { MyI18n } from "./locales";
</script>

<template>
  <MyI18n msg="赤い：{0}　緑：{1}　青い：{2}">
    <div class="bg-red-400 w-10 h-10 rounded-full"></div>
    <div class="bg-green-400 w-10 h-10 rounded-full"></div>
    <div class="bg-blue-400 w-10 h-10 rounded-full"></div>
  </MyI18n>
</template>
```

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

#### lint

Checks for missing and obsolete keys in the source code and i18n files.

## Publishing

To publish the package, first you need to update the version in `package.json`. Depending on the type of change, you can use `npm version <type>` to update the version. The types are:

- `patch`: for small changes and bug fixes
- `minor`: for new features and improvements
- `major`: for breaking changes

After updating the version, you can publish the package to npm with the following command:

```sh
npm publish
```

It's highly recommended to create a new release on GitHub after publishing the package. To create a new release, go to the "Releases" section of the repository and click on "Draft a new release". In the "Tag version" field, enter the version number you just published. For example, if you published version `1.2.3`, you need to create a new tag with the version number as `v1.2.3`
