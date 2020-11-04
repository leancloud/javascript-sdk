import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { terser } from 'rollup-plugin-terser';

export default [
  {
    input: 'src/index.ts',
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
    external: [
      'debug',
      'uuid',
      'base64-arraybuffer',
      'lodash',
      'leancloud-realtime/core',
      'leancloud-realtime-plugin-live-query',
      'eventemitter3',
    ],
    plugins: [
      typescript({
        rootDir: 'src',
        outDir: 'dist',
        declaration: true,
      }),
    ],
  },
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/lc.min.js',
      format: 'umd',
      name: 'LC',
    },
    plugins: [resolve({ browser: true }), typescript(), commonjs(), terser()],
  },
];
