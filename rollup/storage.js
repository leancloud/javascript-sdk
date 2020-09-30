import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { terser } from 'rollup-plugin-terser';

export default [
  {
    input: 'src/_entry/all.ts',
    output: [
      {
        dir: 'dist',
        format: 'cjs',
        entryFileNames: 'index.cjs.js',
      },
      {
        dir: 'dist',
        format: 'esm',
        entryFileNames: 'index.esm.js',
      },
    ],
    external: ['debug', 'uuid', 'base64-arraybuffer'],
    plugins: [
      typescript({
        rootDir: 'src',
        outDir: 'dist',
        declaration: true,
      }),
    ],
  },
  {
    input: 'src/_entry/core.ts',
    output: {
      file: 'dist/lc.min.js',
      format: 'umd',
      name: 'LC',
    },
    plugins: [resolve({ browser: true }), typescript(), commonjs(), terser()],
  },
  {
    input: 'src/_entry/browser.ts',
    output: {
      file: 'dist/browser/lc.min.js',
      format: 'umd',
      name: 'LC',
    },
    plugins: [resolve({ browser: true }), typescript(), commonjs(), terser()],
  },
];
