# gatsby-plugin-manifest-multiple

Basically the same as [`gatsby-plugin-manifest`](https://www.gatsbyjs.org/packages/gatsby-plugin-manifest/) with some differences:

- Full support for child apps (automatically updates manifest and icons using the page location)
- No support for cache busting

Related issue on `gatsby-plugin-manifest`: [#17434](https://github.com/gatsbyjs/gatsby/issues/17434)

## Demo

Click through the different projects on https://www.dkthehuman.com/music-apps/ and note that the favicon updates on navigation

## Usage

See Gatsby's [documentation on using a local plugin](https://www.gatsbyjs.org/docs/creating-a-local-plugin/).

Example usage in `gatsby-config.js` with plugin in `plugins` folder:

```javascript
plugins: [
  {
    resolve: 'gatsby-plugin-manifest-multiple',
    options: {
      name: 'DK the Human',
      short_name: 'DK the Human',
      start_url: '/',
      display: 'minimal-ui',
      icon: 'src/assets/icon.png', // This path is relative to the root of the site.
      theme_color: '#254BD2',
      show_chrome_mini_bar: false,
      childApps: [
        {
          start_url: '/slowtube/',
          name: 'SlowTube',
          short_name: 'SlowTube',
          description: 'Slow down YouTube videos to learn songs by ear.',
          icon: 'content/assets/projects/slowtube.png',
          display: 'standalone',
          show_chrome_mini_bar: true,
        },
        {
          start_url: '/metronome/',
          name: 'Metronome',
          short_name: 'Metronome',
          description: 'Keep perfect time. Every time.',
          icon: 'content/assets/projects/metronome.png',
          display: 'standalone',
          show_chrome_mini_bar: true,
        }
      ],
    },
  },
],
```

## Overview

- `gatsby-node.js`: Generates icons and writes manifests
- `gatsby-ssr.js`: Writes all manifest and icon tags to document head for SSR
- `gatsby-browser.js`: Updates all manifest and icon tags on navigation

## Test using Jest

```sh
cd plugins/gatsby-plugin-manifest-multiple
npx jest --watch
```

## Build files using Babel

(If you don't see the manifest and icon tags in the document head, you probably haven't built the files so Gatsby isn't using the plugin.)

```sh
npm run watch
```
