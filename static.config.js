import { reloadRoutes } from 'react-static/node'
import jdown from 'jdown'
import path from 'path'
import chokidar from 'chokidar'
import React, { Component } from 'react'

chokidar.watch('content').on('all', () => reloadRoutes())

export default {
  siteRoot: 'https://www.swyx.io',
  getSiteData: () => ({
    title: 'React Static',
  }),
  getRoutes: async () => {
    const props = await jdown('content')
    let { posts, drafts, home, talks, talks2018, talks2019 } = props
    drafts = drafts.filter((d) => !!d && !!d.slug) // make safe
    posts = posts.filter((d) => !!d && !!d.slug) // make safe
    talks2018 = talks2018.filter((d) => !!d && !!d.slug) // make safe
    talks2019 = talks2019.filter((d) => !!d && !!d.slug) // make safe
    const recentTalks = talks2019
    // console.log(recentTalks.map(x => Object.keys(x)));

    return [
      {
        path: '/',
        component: 'src/containers/Home',
        getData: () => ({
          ...home,
        }),
      },
      {
        path: '/talks/pending',
        component: 'src/containers/PendingTalks',
        getData: () => ({
          ...talks,
        }),
      },
      {
        path: '/talks',
        component: 'src/containers/Talks',
        getData: () => ({
          recentTalks,
        }),
        children: [
          ...recentTalks.map((talk) => ({
            path: `/${talk.slug}`,
            component: 'src/containers/Talk',
            getData: () => ({
              talk,
            }),
          })),
        ],
      },
      {
        path: '/talks/2018',
        component: 'src/containers/2018Talks',
        getData: () => ({
          recentTalks: talks2018,
        }),
        children: [
          ...talks2018.map((talk) => ({
            path: `/${talk.slug}`,
            component: 'src/containers/Talk',
            getData: () => ({
              talk,
            }),
          })),
        ],
      },
      {
        path: '/writing',
        component: 'src/containers/Writing',
        getData: () => ({
          drafts,
          posts,
        }),
        children: [
          ...posts.map((post) => ({
            path: `/${post.slug}`,
            component: 'src/containers/Post',
            getData: () => ({
              post,
            }),
          })),
          ...drafts.map((draft) => ({
            path: `/draft/${draft.slug}`,
            component: 'src/containers/Post',
            getData: () => ({
              draft,
            }),
          })),
        ],
      },
      {
        is404: true,
        component: 'src/containers/404',
      },
    ]
  },
  webpack: (config) => {
    config.resolve.alias = {
      '@components': path.resolve(__dirname, 'components/'),
    }
    config.module.rules.map((rule) => {
      if (typeof rule.test !== 'undefined' || typeof rule.oneOf === 'undefined') {
        return rule
      }

      rule.oneOf.unshift({
        test: /.mdx$/,
        use: ['babel-loader', '@mdx-js/loader'],
      })

      return rule
    })
    return config
  },

  Document: class CustomHtml extends Component {
    render() {
      const { Html, Head, Body, children, renderMeta } = this.props

      return (
        <Html>
          <Head>
            <meta charSet="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <link href="https://fonts.googleapis.com/css?family=Cherry+Swash|Oxygen" rel="stylesheet" />
          </Head>
          <Body>{children}</Body>
        </Html>
      )
    }
  },
}
