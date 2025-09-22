// @ts-check
import { defineConfig } from 'astro/config';

import mdx from '@astrojs/mdx';

import react from '@astrojs/react';

import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'

import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://[your-username].github.io',
  base: '/[your-repo-name]',
  output: 'static',
  integrations: [mdx({ remarkPlugins:[remarkMath], rehypePlugins:[rehypeKatex] }), react(), sitemap()],
  devToolbar: {
    enabled: false
  }
});