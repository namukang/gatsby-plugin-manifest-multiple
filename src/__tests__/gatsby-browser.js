import { onRouteUpdate } from '../gatsby-browser';

const pluginOptions = {
  name: 'My Website',
  start_url: '/',
  icon: 'main-icon.png',
  childApps: [
    {
      start_url: '/app/',
      name: 'My App',
      icon: 'child-icon.png',
    },
  ],
};

beforeAll(() => {
  global.__PATH_PREFIX__ = '';
});

describe('Manifest', () => {
  beforeEach(() => {
    document.head.innerHTML =
      '<link rel="manifest" href="/manifest.webmanifest">';
  });

  test('updates manifest if navigating to child app', () => {
    const location = {
      pathname: '/app/',
    };
    onRouteUpdate({ location }, pluginOptions);
    expect(document.head).toMatchInlineSnapshot(`
      <head>
        <link
          href="/manifest_my-app.webmanifest"
          rel="manifest"
        />
      </head>
    `);
  });

  test('keeps default manifest if not navigating to child app', () => {
    const location = {
      pathname: '/random-path/',
    };
    onRouteUpdate({ location }, pluginOptions);
    expect(document.head).toMatchInlineSnapshot(`
      <head>
        <link
          href="/manifest.webmanifest"
          rel="manifest"
        />
      </head>
    `);
  });
});

describe('Apple Icons', () => {
  beforeEach(() => {
    document.head.innerHTML =
      '<link rel="apple-touch-icon" sizes="48x48" href="/icons/icon-48x48.png">';
  });

  test('updates apple icons if navigating to child app', () => {
    const location = {
      pathname: '/app/',
    };
    onRouteUpdate({ location }, pluginOptions);
    expect(document.head).toMatchSnapshot();
  });

  test(`keeps apple icons if child app doesn't have own icon`, () => {
    let options = {
      name: 'My Website',
      start_url: '/',
      icon: 'main-icon.png',
      childApps: [
        {
          start_url: '/app/',
          name: 'My App',
        },
      ],
    };
    const location = {
      pathname: '/app/',
    };
    onRouteUpdate({ location }, options);
    expect(document.head).toMatchInlineSnapshot(`
      <head>
        <link
          href="/icons/icon-48x48.png"
          rel="apple-touch-icon"
          sizes="48x48"
        />
      </head>
    `);
  });

  test('keeps apple icons if not navigating to child app', () => {
    const location = {
      pathname: '/random-path/',
    };
    onRouteUpdate({ location }, pluginOptions);
    expect(document.head).toMatchInlineSnapshot(`
      <head>
        <link
          href="/icons/icon-48x48.png"
          rel="apple-touch-icon"
          sizes="48x48"
        />
      </head>
    `);
  });

  describe('Mini bar', () => {
    const promptEvent = {
      preventDefault: jest.fn(),
    };
    window.addEventListener = jest.fn((type, callback) => {
      callback(promptEvent);
    });

    beforeEach(() => {
      window.addEventListener.mockClear();
      promptEvent.preventDefault.mockClear();
    });

    test('shows mini-bar by default', () => {
      const location = {
        pathname: '/',
      };
      onRouteUpdate({ location }, pluginOptions);
      expect(promptEvent.preventDefault).not.toHaveBeenCalled();
    });

    test('prevents mini-bar when set to hidden', () => {
      const testOptions = {
        ...pluginOptions,
        ...{
          show_chrome_mini_bar: false,
        },
      };

      const location = {
        pathname: '/',
      };
      onRouteUpdate({ location }, testOptions);
      expect(promptEvent.preventDefault).toHaveBeenCalled();
    });

    test('shows mini-bar when hidden for parent but shown for child', () => {
      const testOptions = {
        ...pluginOptions,
        ...{
          show_chrome_mini_bar: false,
        },
      };
      testOptions.childApps[0].show_chrome_mini_bar = true;

      onRouteUpdate({ location: { pathname: '/' } }, testOptions);
      expect(promptEvent.preventDefault).toHaveBeenCalled();

      promptEvent.preventDefault.mockClear();
      onRouteUpdate({ location: { pathname: '/app/' } }, testOptions);
      expect(promptEvent.preventDefault).not.toHaveBeenCalled();
    });
  });
});
