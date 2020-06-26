import ManifestWriter from './ManifestWriter';

export async function onPostBootstrap({ reporter, parentSpan }, pluginOptions) {
  const activity = reporter.activityTimer(`Build manifest and related icons`, {
    parentSpan,
  });
  activity.start();

  const manifestWriters = [];
  const mainWriter = new ManifestWriter('/', pluginOptions);
  manifestWriters.push(mainWriter);

  const { childApps } = pluginOptions;
  if (Array.isArray(childApps)) {
    childApps.forEach(childApp => {
      const childWriter = new ManifestWriter(childApp.start_url, pluginOptions);
      manifestWriters.push(childWriter);
    });
  }

  const promises = [];
  manifestWriters.forEach(writer => {
    promises.push(writer.generateIcons());
    promises.push(writer.writeManifest());
  });
  await Promise.all(promises);

  activity.end();
}
