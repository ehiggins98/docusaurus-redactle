import { LoadContext, Plugin } from '@docusaurus/types';
import path from 'path';
import fs from 'fs';
import { glob } from 'glob';

function getAllMarkdownContent(docsDir: string) {
  return new Promise<string[]>((resolve) => {
    glob(path.join(docsDir, '**')).then((matches) => resolve(matches.filter((fp) => !fs.lstatSync(fp).isDirectory())));
  })
}

function readFiles(paths: string[]): string[] {
  return paths.map((path) => fs.readFileSync(require.resolve(path), { encoding: 'utf8', flag: 'r' }));
}

export default async function plugin(context: LoadContext, options: unknown): Promise<Plugin<string[]>> {
  return {
    name: 'docusaurus-plugin-redactle',
    async loadContent() {
      if (!options || typeof options !== 'object' || !('contentDirectory' in options) || typeof options.contentDirectory !== 'string') {
        throw Error('contentDirectory must be specified as a string')
      }

      const test = await getAllMarkdownContent(options.contentDirectory);
      return readFiles(test.filter((file) => file.endsWith('.md') || file.endsWith('.mdx')));
    },
    async contentLoaded({content, actions}) {
      if (!content || Object.keys(content).length === 0) return;

      const data = await actions.createData('pages.json', JSON.stringify(content));

      let baseUrl = context.siteConfig.baseUrl;
      if (baseUrl.endsWith('/')) {
        baseUrl += "/";
      }
      let path = options && typeof options === 'object' && 'path' in options && typeof options.path === 'string' ? options.path : 'redactle';
      if (path.startsWith('/')) {
        path = path.substring(1);
      }

      actions.addRoute({
        path: context.siteConfig.baseUrl + path,
        exact: true,
        component: "docusaurus-plugin-redactle/src/pages/RedactlePage",
        modules: {
          files: data,
        },
      });
    },
  };
}