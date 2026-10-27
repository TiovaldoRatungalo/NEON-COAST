import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  // Relax React 19 compiler strict rules for the game code.
  // - purity/immutability: mutating Three.js uniforms/refs in useFrame is standard R3F
  // - set-state-in-effect: async loading state driven by effects is standard React
  // - refs: refs are needed for Three.js object access outside render
  {
    files: ["src/game/**/*.tsx", "src/game/**/*.ts", "src/components/**/*.tsx"],
    rules: {
      "react-hooks/purity": "off",
      "react-hooks/immutability": "off",
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/refs": "off",
    },
  },
]);

export default eslintConfig;

