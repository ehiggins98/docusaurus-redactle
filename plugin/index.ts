import { LoadContext, Plugin } from '@docusaurus/types';

export default async function plugin(context: LoadContext, options: unknown): Promise<Plugin<unknown>> {
  return {
    name: 'docusaurus-plugin-redactle',
    async loadContent() {
      /* ... */
    },
    async contentLoaded({content, actions}) {
      /* ... */
    },
    /* other lifecycle API */
  };
}