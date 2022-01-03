module.exports = {
    locales: {
        '/': {
            title: "Gravity Docs",
            description: "Gravity is an open source, public blockchain protocol that provides fundamental infrastructure for a decentralized economy and enables open participation in the creation of new financial primitives to power the innovation of money.",
        },
        '/zh/': {
            title: "Gravity 文档",
            description: "Gravity is an open source, public blockchain protocol that provides fundamental infrastructure for a decentralized economy and enables open participation in the creation of new financial primitives to power the innovation of money.",
        },
        '/ja/': {
            title: "Gravity ドキュメント",
            description: "Gravitygravity-bridge  is an open source, public blockchain protocol that provides fundamental infrastructure for a decentralized economy and enables open participation in the creation of new financial primitives to power the innovation of money.",
        }
    },
    markdown: {
        extendMarkdown: (md) => {
            md.use(require("markdown-it-footnote"));
        },
    },
    plugins: [
        [
            "@vuepress/register-components",
            {
                componentsDir: "theme/components",
            },
        ],
        [
            "vuepress-plugin-mathjax",
            {
                target: "svg",
                macros: {
                    "*": "\\times",
                },
            },
        ],
    ],
    head: [
        [
            "link",
            {
                rel: "stylesheet",
                type: "text/css",
                href: "https://cloud.typography.com/7420256/6416592/css/fonts.css",
            },
        ],
        [
            "link",
            {
                rel: "stylesheet",
                type: "text/css",
                href: "https://www.terra.money/static/fonts/jetbrainsMono.css?updated=190220"
            },
        ],
        [
            "link",
            {
                rel: "stylesheet",
                type: "text/css",
                href: "https://fonts.googleapis.com/css?family=Material+Icons|Material+Icons+Outlined",
            },
        ],

        [
            "link",
            {
                rel: "stylesheet",
                type: "text/css",
                href: "https://fonts.googleapis.com/css?family=Noto+Sans+KR:400,500,700&display=swap",
            },
        ],
        [
            "link",
            {
                rel: "icon",
                type: "image/png",
                href: "/img/favicon.png",
            },
        ],
        [
            "script",
            {},
            `window.onload = function() {
requestAnimationFrame(function() {
    if (location.hash) {
    const element = document.getElementById(location.hash.slice(1))

    if (element) {
        element.scrollIntoView()
    }
    }
})
}`,
        ],
    ],
    themeConfig: {
        locales: {
            '/': {
                selectText: 'Languages',
                label: 'English',
                nav: [
                    { text: "Top", link: "/" },
                    { text: "Architecture", link: "/architecture/" },
                    { text: "Design", link: "/design/" },
                    { text: "Moudle", link: "/moudle/" },
                    { text: "Orchestrator", link: "/orchestrator/" },
                    { text: "Spec", link: "/spec/" },
                    { text: "Testnet", link: "/testnet/" },
                    {
                        text: "GitHub",
                        link: "https://github.com/highwayns/cosmos-sdk",
                        icon: "/img/github.svg",
                    },
                ],
                sidebar: {
                    "/architecture/": [
                        "/architecture/",
                    ],
                    "/design/": [
                        "/design/",
                        "/design/arbitrary-logic",
                    ],
                    "/moudle/": [
                        "/moudle/",
                        {
                            title: "gravity",
                            children: [
                                "/moudle/gravity/spec/",
                                "/moudle/gravity/spec/01_definitions",
                                "/moudle/gravity/spec/02_state",
                                "/moudle/gravity/spec/03_state_transitions",
                                "/moudle/gravity/spec/04_messages",
                                "/moudle/gravity/spec/05_end_block",
                                "/moudle/gravity/spec/06_events",
                                "/moudle/gravity/spec/07_params",
                            ],
                            collapsable: true,
                        },
                    ],
                    "/orchestrator/": [
                        "/orchestrator/",
                    ],
                    "/spec/": [
                        "/spec/",
                        "/spec/batch-creation-spec",
                        "/spec/slashing-spec",
                        "/spec/valset-creation-spec",
                    ],
                    "/testnet/": [
                        "/testnet/",
                    ],
                    "/": [{
                        title: "Overview",
                        children: [
                            "/notes",
                        ],
                        collapsable: false,
                    }, ],
                },
            },
            '/zh/': {
                selectText: '选择语言',
                // 该语言在下拉菜单中的标签
                label: '简体中文',
                nav: [
                    { text: "首页", link: "/zh/" },
                    { text: "Architecture", link: "/zh/architecture/" },
                    { text: "Design", link: "/zh/design/" },
                    { text: "Moudle", link: "/zh/moudle/" },
                    { text: "Orchestrator", link: "/zh/orchestrator/" },
                    { text: "Spec", link: "/zh/spec/" },
                    { text: "Testnet", link: "/zh/testnet/" },
                    {
                        text: "GitHub",
                        link: "https://github.com/highwayns/cosmos-sdk",
                        icon: "/img/github.svg",
                    },
                ],
                sidebar: {
                    "/zh/architecture/": [
                        "/zh/architecture/",
                    ],
                    "/zh/design/": [
                        "/zh/design/",
                        "/zh/design/arbitrary-logic",
                    ],
                    "/zh/moudle/": [
                        "/zh/moudle/",
                        {
                            title: "gravity",
                            children: [
                                "/zh/moudle/gravity/spec/",
                                "/zh/moudle/gravity/spec/01_definitions",
                                "/zh/moudle/gravity/spec/02_state",
                                "/zh/moudle/gravity/spec/03_state_transitions",
                                "/zh/moudle/gravity/spec/04_messages",
                                "/zh/moudle/gravity/spec/05_end_block",
                                "/zh/moudle/gravity/spec/06_events",
                                "/zh/moudle/gravity/spec/07_params",
                            ],
                            collapsable: true,
                        },
                    ],
                    "/zh/orchestrator/": [
                        "/zh/orchestrator/",
                    ],
                    "/zh/spec/": [
                        "/zh/spec/",
                        "/zh/spec/batch-creation-spec",
                        "/zh/spec/slashing-spec",
                        "/zh/spec/valset-creation-spec",
                    ],
                    "/zh/testnet/": [
                        "/zh/testnet/",
                    ],
                    "/zh/": [{
                        title: "Overview",
                        children: [
                            "/zh/notes",
                        ],
                        collapsable: false,
                    }, ],
                },
            },
            '/ja/': {
                selectText: '言語選択',
                // 该语言在下拉菜单中的标签
                label: '日本語',
                nav: [
                    { text: "トップ", link: "/ja/" },
                    { text: "Architecture", link: "/ja/architecture/" },
                    { text: "Design", link: "/ja/design/" },
                    { text: "Moudle", link: "/ja/moudle/" },
                    { text: "Orchestrator", link: "/ja/orchestrator/" },
                    { text: "Spec", link: "/ja/spec/" },
                    { text: "Testnet", link: "/ja/testnet/" },
                    {
                        text: "GitHub",
                        link: "https://github.com/highwayns/cosmos-sdk",
                        icon: "/img/github.svg",
                    },
                ],
                sidebar: {
                    "/ja/architecture/": [
                        "/ja/architecture/",
                    ],
                    "/ja/design/": [
                        "/ja/design/",
                        "/ja/design/arbitrary-logic",
                    ],
                    "/ja/moudle/": [
                        "/ja/moudle/",
                        {
                            title: "gravity",
                            children: [
                                "/ja/moudle/gravity/spec/",
                                "/ja/moudle/gravity/spec/01_definitions",
                                "/ja/moudle/gravity/spec/02_state",
                                "/ja/moudle/gravity/spec/03_state_transitions",
                                "/ja/moudle/gravity/spec/04_messages",
                                "/ja/moudle/gravity/spec/05_end_block",
                                "/ja/moudle/gravity/spec/06_events",
                                "/ja/moudle/gravity/spec/07_params",
                            ],
                            collapsable: true,
                        },
                    ],
                    "/ja/orchestrator/": [
                        "/ja/orchestrator/",
                    ],
                    "/ja/spec/": [
                        "/ja/spec/",
                        "/ja/spec/batch-creation-spec",
                        "/ja/spec/slashing-spec",
                        "/ja/spec/valset-creation-spec",
                    ],
                    "/ja/testnet/": [
                        "/ja/testnet/",
                    ],
                    "/ja/": [{
                        title: "Overview",
                        children: [
                            "/ja/notes",
                        ],
                        collapsable: false,
                    }, ],
                },
            },
        },
        sidebarDepth: 3,
        // overrideTheme: 'dark',
        // prefersTheme: 'dark',
        // overrideTheme: { light: [6, 18], dark: [18, 6] },
        // theme: 'default-prefers-color-scheme',
        logo: "/img/logo-cosmos.svg",
        lastUpdated: "Updated on",
        repo: "teiwei2003/gravity-bridge",
        editLinks: true,
        editLinkText: "Edit this page on GitHub",
        docsBranch: 'main',
        docsDir: "docs",
        algolia: {
            apiKey: "5957091e293f7b97f2994bde312aed99",
            indexName: "terra-project",
        },
    },
};