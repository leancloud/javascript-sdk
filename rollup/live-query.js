import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { terser } from 'rollup-plugin-terser';

export default [
  {
    input: 'src/entry/live-query.ts',
    output: [
      {
        dir: 'live-query/dist',
        format: 'cjs',
        entryFileNames: 'index.cjs.js',
      },
      {
        dir: 'live-query/dist',
        format: 'esm',
        entryFileNames: 'index.esm.js',
      },
    ],
    external: ['leancloud-realtime/core', 'leancloud-realtime-plugin-live-query', 'eventemitter3'],
    plugins: [typescript()],
  },
  {
    input: 'src/entry/live-query.ts',
    output: {
      file: 'live-query/dist/live-query.min.js',
      format: 'umd',
      name: 'LiveQuery',
    },
    plugins: [resolve({ browser: true }), commonjs(), typescript(), terser()],
  },
];
