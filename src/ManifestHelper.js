import React from 'react';
import { withPrefix as fallbackWithPrefix, withAssetPrefix } from 'gatsby';

// TODO: remove for v3
const withPrefix = withAssetPrefix || fallbackWithPrefix;

function getKebabCase(text) {
  if (!text) {
    return '';
  }
  return text.replace(/\s+/g, '-').toLowerCase();
}

function getAppSuffix(mainManifest = {}, childManifest = {}) {
  let suffix = '';
  if (childManifest.lang && childManifest.lang !== mainManifest.lang) {
    suffix = '_' + childManifest.lang;
  } else if (childManifest.name && childManifest.name !== mainManifest.name) {
    suffix = '_' + getKebabCase(childManifest.name);
  }
  return suffix;
}

function getManifestFilename(appSuffix = '') {
  return `manifest${appSuffix}.webmanifest`;
}

// Default icons to generate
function getDefaultIcons(appSuffix = '') {
  const sizes = [48, 72, 96, 144, 192, 256, 384, 512];
  const icons = sizes.map(size => ({
    src: `icons/icon${appSuffix}-${size}x${size}.png`,
    sizes: `${size}x${size}`,
    type: `image/png`,
  }));
  return icons;
}

function convertToHTMLElement(reactElement) {
  if (!reactElement) {
    return null;
  }

  const { type, props } = reactElement;
  const el = document.createElement(type);
  Object.entries(props).forEach(([attr, value]) => {
    if (typeof value !== 'undefined') {
      el.setAttribute(attr, value);
    }
  });
  return el;
}

class ManifestHelper {
  static TAG_TYPES = {
    REACT: 'react',
    HTML: 'html',
  };

  manifestFilename;
  pluginOptions;

  constructor(pathname, options, tagType = this.constructor.TAG_TYPES.REACT) {
    let pluginOptions = { ...options };
    const { childApps, ...mainOptions } = pluginOptions;

    let manifestFilename = getManifestFilename();
    let defaultIcons = getDefaultIcons();

    // Override plugin options with child app options if applicable
    if (Array.isArray(childApps)) {
      const appOptions = childApps.find(app =>
        pathname.startsWith(app.start_url)
      );
      if (appOptions) {
        const appSuffix = getAppSuffix(pluginOptions, appOptions);
        manifestFilename = getManifestFilename(appSuffix);
        if (appOptions.icon) {
          defaultIcons = getDefaultIcons(appSuffix);
        }
        pluginOptions = {
          ...mainOptions,
          ...appOptions,
        };
      }
    }

    // Set icons
    pluginOptions.icons = pluginOptions.icons || defaultIcons;
    if (pluginOptions.icon_options) {
      pluginOptions.icons = pluginOptions.icons.map(icon => ({
        ...pluginOptions.icon_options,
        ...icon,
      }));
    }

    this.manifestFilename = manifestFilename;
    this.pluginOptions = pluginOptions;

    if (tagType === this.constructor.TAG_TYPES.HTML) {
      const origManifest = this.getManifestLinkTag.bind(this);
      this.getManifestLinkTag = () => convertToHTMLElement(origManifest());

      const origFavicon = this.getFaviconLinkTag.bind(this);
      this.getFaviconLinkTag = () => convertToHTMLElement(origFavicon());

      const origThemeColor = this.getThemeColorMetaTag.bind(this);
      this.getThemeColorMetaTag = () => convertToHTMLElement(origThemeColor());

      const origAppleIcon = this.getAppleIconLinkTags.bind(this);
      this.getAppleIconLinkTags = () =>
        origAppleIcon().map(convertToHTMLElement);
    }
  }

  getFileUrl(file) {
    // TODO: Support cache busting
    // const digest = createContentDigest(fs.readFileSync(file));
    // return withPrefix(addDigestToPath(favicon, iconDigest, cacheBusting))
    return withPrefix(file);
  }

  getManifestLinkTag() {
    return (
      <link
        key={`gatsby-plugin-manifest-link`}
        rel="manifest"
        href={withPrefix(this.manifestFilename)}
        crossOrigin={this.pluginOptions.crossOrigin}
      />
    );
  }

  getFaviconLinkTag() {
    const { icon, icons, include_favicon } = this.pluginOptions;
    if (!icon || icons.length === 0 || include_favicon === false) {
      return null;
    }
    return (
      <link
        key={`gatsby-plugin-manifest-icon-link`}
        rel="shortcut icon"
        href={this.getFileUrl(icons[0].src)}
      />
    );
  }

  getThemeColorMetaTag() {
    const { theme_color, theme_color_in_head } = this.pluginOptions;
    if (!theme_color || theme_color_in_head === false) {
      return null;
    }
    return (
      <meta
        key={`gatsby-plugin-manifest-meta`}
        name="theme-color"
        content={this.pluginOptions.theme_color}
      />
    );
  }

  getAppleIconLinkTags() {
    const { legacy, icons } = this.pluginOptions;
    if (legacy === false) {
      return [];
    }
    return icons.map(icon => (
      <link
        key={`gatsby-plugin-manifest-apple-touch-icon-${icon.sizes}`}
        rel="apple-touch-icon"
        sizes={icon.sizes}
        href={this.getFileUrl(icon.src)}
      />
    ));
  }

  shouldHideChromeMiniBar() {
    const { show_chrome_mini_bar } = this.pluginOptions;
    return show_chrome_mini_bar === false;
  }
}

export default ManifestHelper;
