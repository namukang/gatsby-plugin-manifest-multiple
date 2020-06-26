import ManifestHelper from './ManifestHelper';

function hasDiffAttr(el1, el2, attr) {
  return el1 && el2 && el1.getAttribute(attr) !== el2.getAttribute(attr);
}

function promptListener(e) {
  // Prevent Chrome 76 and later from showing the mini-infobar
  e.preventDefault();
}

exports.onRouteUpdate = function({ location }, pluginOptions) {
  const { childApps } = pluginOptions;
  if (!childApps) {
    return;
  }

  const helper = new ManifestHelper(
    location.pathname,
    pluginOptions,
    ManifestHelper.TAG_TYPES.HTML
  );

  const oldTags = [];
  const newTags = [];

  const currentManifestEl = document.head.querySelector('link[rel="manifest"]');
  const manifestEl = helper.getManifestLinkTag();
  if (hasDiffAttr(currentManifestEl, manifestEl, 'href')) {
    oldTags.push(currentManifestEl);
    newTags.push(manifestEl);
  }

  const currentFaviconEl = document.head.querySelector(
    'link[rel="shortcut icon"]'
  );
  const faviconEl = helper.getFaviconLinkTag();
  if (hasDiffAttr(currentFaviconEl, faviconEl, 'href')) {
    oldTags.push(currentFaviconEl);
    newTags.push(faviconEl);
  }

  const currentThemeColorEl = document.head.querySelector(
    'meta[name="theme-color"]'
  );
  const themeColorEl = helper.getThemeColorMetaTag();
  if (hasDiffAttr(currentThemeColorEl, themeColorEl, 'content')) {
    oldTags.push(currentThemeColorEl);
    newTags.push(themeColorEl);
  }

  const currentAppleIconEls = document.head.querySelectorAll(
    'link[rel="apple-touch-icon"]'
  );
  const appleIconEls = helper.getAppleIconLinkTags();
  const updateAppleIcons =
    currentAppleIconEls.length > 0 &&
    appleIconEls.length > 0 &&
    hasDiffAttr(currentAppleIconEls[0], appleIconEls[0], 'href');
  if (updateAppleIcons) {
    oldTags.push(...currentAppleIconEls);
    newTags.push(...appleIconEls);
  }

  oldTags.forEach(tag => tag.parentNode.removeChild(tag));
  newTags.forEach(tag => document.head.appendChild(tag));

  // Note that 'beforeinstallprompt' is only called on initial page load and not on subsequent navigations
  window.removeEventListener('beforeinstallprompt', promptListener);
  if (helper.shouldHideChromeMiniBar()) {
    window.addEventListener('beforeinstallprompt', promptListener);
  }
};
