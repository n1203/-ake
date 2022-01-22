module.exports = {
  title: 'Module-axios',
  description: 'A modular axios request library.',
  themeConfig: {
    repo: 'cabbage9/cn-vitepress',
    docsBranch: 'master',
    docsDir: 'docs',
    // algolia: {
    //   apiKey: 'b564625be65feb637a8f776517d5b143',
    //   indexName: 'cn-vitepress_NAME',
    // },
    editLinks: true,
    editLinkText: '在帮助我们在GitHub上改善此页',
    lastUpdated: '上次更新',

    nav: [
      { text: '首页', link: '/' },
      { text: '配置项', link: '/config/' },
      { text: 'API', link: '/api/' },
    ],
    sidebar: false,
  },
}