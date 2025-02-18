import type {LoadContext, Plugin} from '@docusaurus/types';

export default function docusaurusThemeRedactle(context: LoadContext): Plugin<void> {
  const {
    siteConfig: {themeConfig},
  } = context;

  return {
    name: 'docusaurus-theme-redactle',

    getThemePath() {
      return '../lib';
    },
    getTypeScriptThemePath() {
      return '../src';
    },
  };
}
