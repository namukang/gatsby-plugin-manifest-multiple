import fs from 'fs';
import path from 'path';
import sharp from './safe-sharp';
import { cpuCoreCount } from 'gatsby-core-utils';
import ManifestHelper from './ManifestHelper';

sharp.simd(true);

// Handle Sharp's concurrency based on the Gatsby CPU count
// See: http://sharp.pixelplumbing.com/en/stable/api-utility/#concurrency
// See: https://www.gatsbyjs.org/docs/multi-core-builds/
sharp.concurrency(cpuCoreCount());

class ManifestWriter extends ManifestHelper {
  // Plugin options that should not be included in the manifest
  static nonManifestOptions = [
    'cache_busting_mode',
    'childApps',
    'crossOrigin',
    'icon_options',
    'icon',
    'include_favicon',
    'legacy',
    'plugins',
    'show_chrome_mini_bar',
    'theme_color_in_head',
  ];

  async generateIcons() {
    const { icon: srcIcon, icons } = this.pluginOptions;
    if (!srcIcon) {
      return;
    }

    if (!fs.existsSync(srcIcon)) {
      throw new Error(
        `icon (${srcIcon}) does not exist as defined in gatsby-config.js. Make sure the file exists relative to the root of the site.`
      );
    }

    const sharpIcon = sharp(srcIcon);
    const metadata = await sharpIcon.metadata();
    if (metadata.width !== metadata.height) {
      console.warn(
        `The icon (${srcIcon}) you provided to 'gatsby-plugin-manifest' is not square.\n` +
          `The icons we generate will be square and for the best results we recommend you provide a square icon.\n`
      );
    }

    return Promise.all(icons.map(icon => this.generateIcon(icon, srcIcon)));
  }

  async generateIcon(icon, srcIcon) {
    const iconDir = path.join('public', path.dirname(icon.src));
    if (!fs.existsSync(iconDir)) {
      fs.mkdirSync(iconDir, { recursive: true });
    }

    const iconPath = path.join('public', icon.src);
    const size = parseInt(icon.sizes.substring(0, icon.sizes.lastIndexOf('x')));

    // For vector graphics, instruct sharp to use a pixel density
    // suitable for the resolution we're rasterizing to.
    // For pixel graphics sources this has no effect.
    // Sharp accept density from 1 to 2400
    const density = Math.min(2400, Math.max(1, size));

    return sharp(srcIcon, { density })
      .resize({
        width: size,
        height: size,
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 },
      })
      .toFile(iconPath);
  }

  writeManifest() {
    const manifest = { ...this.pluginOptions };

    // Delete options we won't pass to the manifest.webmanifest
    this.constructor.nonManifestOptions.forEach(option => {
      delete manifest[option];
    });

    fs.writeFileSync(
      path.join(`public`, this.manifestFilename),
      JSON.stringify(manifest)
    );
  }
}

export default ManifestWriter;
