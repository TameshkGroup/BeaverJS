import html from "rollup-plugin-html";
import ts from "rollup-plugin-ts";
import serve from "rollup-plugin-serve";
import livereload from "rollup-plugin-livereload";
//import babel from "@rollup/plugin-babel";
import nodeResolve from "rollup-plugin-node-resolve";
import babel from "rollup-plugin-babel";
import commonjs from "rollup-plugin-commonjs";
import replace from "@rollup/plugin-replace";
import pug from "rollup-plugin-pug";

export default {
  input: "src/main.ts",
  output: {
    //dest: "dist/phenomen.js",
    file: "dist/phenomen.js",
    moduleName: "phenomenJS",
    format: "umd",
  },
  plugins: [
    commonjs({
      include: ["node_modules/nanoid/**", "node_modules/lodash/**"], // Default: undefined
    }),
    nodeResolve({
      mainFields: ["browser", "module", "main"],
    }),
    html({
      include: ["**/*.ph", "**/*.html"],
    }),

    //babel({}),
    // babel({
    //   babelHelpers: "bundled",
    //   exclude: "node_modules/**",
    // }),
    replace({
      "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
    }),
    serve(),
    livereload(),
    ts({
      include: ["**/*.ph", "**/*.ts", "**/*.html"],
    }),
    pug({
      include: ["**/**.ph"],
    }),
  ],
};
