import nodeResolve from "@rollup/plugin-node-resolve";
import dts from "rollup-plugin-dts";
import postcss from "rollup-plugin-postcss";
const isProduction = process.env.NODE_ENV === "production";
import terser from "@rollup/plugin-terser";
import typescript from "@rollup/plugin-typescript";
export default [
  {
    input: "src/index.ts",
    output: [
      {
        file: "dist/cjs/index.js",
        format: "cjs",
        sourcemap: true,
        exports: "named",
      },
      {
        file: "dist/esm/index.js",
        format: "esm",
        sourcemap: true,
        exports: "named",
      },
      {
        file: "dist/umd/index.js",
        format: "umd",
        name: "UniversalChatbot",
        sourcemap: true,
        exports: "named",
      },
    ],
    plugins: [
      nodeResolve(),
      typescript({
        tsconfig: "./tsconfig.json",
        declaration: false,
        rootDir: "src",
      }),
      postcss({
        plugins: [], // optional PostCSS plugins if needed
      }),
      isProduction && terser(),
    ].filter(Boolean),
    external: [],
  },
  {
    input: "src/index.ts",
    output: { file: "dist/index.d.ts", format: "esm" },
    plugins: [dts()],
    external: [/\.(css|less|scss)$/],
  },
];
