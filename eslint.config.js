// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");
const tseslint = require("typescript-eslint");

const typescriptFiles = ["**/*.{ts,tsx}"];
const typedConfigs = tseslint.configs.recommendedTypeChecked.map((config) => ({
  ...config,
  files: typescriptFiles,
}));

module.exports = defineConfig([
  expoConfig,
  typedConfigs,
  {
    ignores: [".tamagui/*", "coverage/*", "dist/*"],
    linterOptions: {
      reportUnusedDisableDirectives: "error",
    },
  },
  {
    files: typescriptFiles,
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: __dirname,
      },
    },
    rules: {
      "@typescript-eslint/ban-ts-comment": [
        "error",
        {
          "ts-check": false,
          "ts-expect-error": "allow-with-description",
          "ts-ignore": true,
          "ts-nocheck": true,
          minimumDescriptionLength: 10,
        },
      ],
      "@typescript-eslint/no-deprecated": "error",
      "@typescript-eslint/no-non-null-assertion": "error",
      "@typescript-eslint/no-unsafe-type-assertion": "error",
      "@typescript-eslint/switch-exhaustiveness-check": "error",
    },
  },
  {
    files: ["tamagui.config.ts"],
    rules: {
      "@typescript-eslint/no-empty-object-type": [
        "error",
        {
          allowInterfaces: "with-single-extends",
        },
      ],
    },
  },
  {
    files: [
      "src/features/*/hooks/**/*.{ts,tsx}",
      "src/features/*/{selectors,utils}.ts",
      "src/{lib,services,store}/**/*.{ts,tsx}",
    ],
    rules: {
      "@typescript-eslint/no-magic-numbers": [
        "error",
        {
          detectObjects: false,
          enforceConst: true,
          ignore: [-1, 0, 1, 2, 100],
          ignoreArrayIndexes: true,
          ignoreDefaultValues: true,
          ignoreEnums: true,
          ignoreNumericLiteralTypes: true,
          ignoreReadonlyClassProperties: true,
        },
      ],
    },
  },
  {
    files: [
      "src/app/**/*.tsx",
      "src/components/layout/**/*.tsx",
      "src/features/**/*.tsx",
    ],
    ignores: ["**/__tests__/**", "**/*.{spec,test}.tsx"],
    rules: {
      "react/jsx-no-literals": [
        "error",
        {
          allowedStrings: ["/", "·", "%", "♦", "404"],
          ignoreProps: true,
          noStrings: true,
        },
      ],
    },
  },
  {
    files: ["src/app/**/*.{ts,tsx}", "src/features/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              regex: "^@/features/[^/]+/.+",
              message:
                "Import another feature through its public index instead of reaching into its internals.",
            },
            {
              regex: "^@/components/.+",
              message: "Import shared UI through the components public index.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["src/components/ui/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              regex:
                "^(?:expo-router|zustand)(?:/|$)|(?:^|/)(?:app|api|apis|context|contexts|features|queries|services|store|stores)(?:/|$)",
              message:
                "Shared UI cannot depend on routes, features, stores, or business data models.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["src/features/*/components/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              regex:
                "^(?:expo-router|zustand)(?:/|$)|(?:^|/)(?:app|api|apis|context|contexts|queries|services|store|stores)(?:/|$)|^(?:@/|\\.{1,2}/)(?:.+/)?[^/]*(?:-api|-container|-context|-query|-screen|-service|-store)(?:\\.[^/]*)?$|^@/features(?:/|$)|^(?:\\.\\./){2,}",
              message:
                "Feature presentation components cannot read routes, business contexts, APIs, stores, or other feature internals directly.",
            },
          ],
        },
      ],
    },
  },
]);
