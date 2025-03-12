import { LoadContext, Plugin } from '@docusaurus/types';
import path from 'path';
import fs from 'fs';
import glob from 'glob';

type Content = {
  filename: string;
  filepath: string;
  content: string;
}

function getAllMarkdownContent(docsDir: string) {
  return new Promise<string[]>((resolve) => {
    glob(path.join(docsDir, '**'), (err, matches) => {
      resolve(matches.filter((fp) => !fs.lstatSync(fp).isDirectory()));
    })
  })
}

function readFiles(paths: string[]): string[] {
  return paths.map((path) => fs.readFileSync(require.resolve(path), { encoding: 'utf8', flag: 'r' }));
}

export default async function plugin(context: LoadContext, options: unknown): Promise<Plugin<string[]>> {
  return {
    name: 'docusaurus-plugin-redactle',
    async loadContent() {
      const docsDir = path.join(context.siteDir, "docs");
      const test = await getAllMarkdownContent(docsDir);
      return readFiles(test.filter((file) => file.endsWith('.md') || file.endsWith('.mdx')));
    },
    async contentLoaded({content, actions}) {
      if (!content || Object.keys(content).length === 0) return;

      actions.addRoute({
        path: "/redactle",
        exact: true,
        component: "docusaurus-plugin-redactle/src/pages/RedactlePage",
        props: {
          files: content
        }
      });
    },
  };
}