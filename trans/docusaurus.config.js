import {themes as prismThemes} from 'prism-react-renderer';

const config = {
  title: 'Transgender.rs Doc',
  tagline: '',
  favicon: 'img/favicon.ico',

  url: 'https://sberm.com',
  baseUrl: '/trans/',

  organizationName: 'Sberm',
  projectName: 'Transgender.rs',

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      '@docusaurus/preset-classic',
      ({
        docs: {
	  routeBasePath: '/',
          sidebarPath: './sidebars.js',
        },
        blog: false,
        'theme': {
          customCss: ['./src/css/custom.css'],
	},
      }),
    ],
  ],

  themeConfig:
    ({
      // TODO: replace social card
      image: 'img/docusaurus-social-card.jpg',
      navbar: {
        title: 'Transgender.rs',
        logo: {
          alt: 'Transgender.rs Logo',
          src: 'img/logo.svg',
        },
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'transSideBar',
            position: 'left',
            label: 'Docs',
          },
        ],
      },
      footer: {
        style: 'dark',
        copyright: `Copyright © ${new Date().getFullYear()} Howard Chu`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
      },
    }),
};

export default config;
