// Rollup plugins

// import babel from 'rollup-plugin-babel';
import buble from 'rollup-plugin-buble';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import { uglify } from 'rollup-plugin-uglify';

export default {
    input: "./src/index.js",
    output: {
        file: "dist/index.js",
        format: "iife",
        name: "index",
        // sourcemap: true,
    },
    plugins: [
        resolve(),
        commonjs(),
        // uglify(),
        buble()
    ],
    // external(id) { return !/^[\.\/]/.test(id) }
}