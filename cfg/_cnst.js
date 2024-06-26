module.exports = {
  prettierDirs: [
    'src,scripts,e2e,playwright,docs,cfg,resources,.github,public,static,components,content,layouts,pages,plugins,middleware,store,blocks',
  ],
  // ts,tsx,css,scss excluded, cause they need to run in special order (overlap between >1 tool):
  prettierExtensionsExclusive: 'js,jsx,json,md,graphql,yml,yaml,html',
  // everything that prettier supports:
  prettierExtensionsAll: 'ts,tsx,css,scss,js,jsx,json,md,graphql,yml,yaml,html,vue',
  stylelintExtensions: 'css,scss',
  lintExclude: [
    './**/__exclude/**',
    './docs/.vitepress/dist/**',
    './docs/.vitepress/cache/**',
    './CHANGELOG.md',
  ],
}
