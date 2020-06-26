import ManifestHelper from './ManifestHelper';

exports.onRenderBody = function(
  { setHeadComponents, pathname },
  pluginOptions
) {
  const helper = new ManifestHelper(pathname, pluginOptions);

  const allHeadComponents = [
    helper.getFaviconLinkTag(),
    helper.getManifestLinkTag(),
    helper.getThemeColorMetaTag(),
    ...helper.getAppleIconLinkTags(),
  ];

  const headComponents = allHeadComponents.filter(tag => tag !== null);
  setHeadComponents(headComponents);
};
