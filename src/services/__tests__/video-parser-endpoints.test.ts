import { vi } from 'vitest';

type EndpointModule = typeof import('../video-parser-endpoints');

async function loadModule(options?: {
  platform?: 'ios' | 'android';
  constants?: {
    expoConfig?: { hostUri?: string | null };
    expoGoConfig?: { debuggerHost?: string | null };
    linkingUri?: string | null;
    manifest2?: {
      extra?: {
        expoClient?: {
          hostUri?: string | null;
        };
      };
    };
  };
}): Promise<EndpointModule> {
  const platform = options?.platform ?? 'ios';
  const constants = options?.constants ?? {};

  vi.resetModules();

  vi.doMock('react-native', () => ({
    Platform: { OS: platform },
  }));
  vi.doMock('expo-constants', () => ({
    __esModule: true,
    default: {
      expoConfig: {},
      expoGoConfig: {},
      linkingUri: null,
      ...constants,
    },
  }));

  return (await vi.importActual('../video-parser-endpoints')) as EndpointModule;
}

const ORIGINAL_ENV = process.env;

beforeEach(() => {
  process.env = { ...ORIGINAL_ENV };
  delete process.env.EXPO_PUBLIC_VIDEO_PARSER_BASE_URL;
  delete process.env.EXPO_PUBLIC_VIDEO_PARSER_WS_URL;
  delete process.env.EXPO_PUBLIC_VIDEO_PARSER_HOST;
  delete process.env.EXPO_PUBLIC_VIDEO_PARSER_PORT;
});

afterAll(() => {
  process.env = ORIGINAL_ENV;
});

describe('video-parser-endpoints', () => {
  it('uses explicit HTTP base URL from env and trims trailing slash', async () => {
    process.env.EXPO_PUBLIC_VIDEO_PARSER_BASE_URL = 'https://api.example.com/';
    const module = await loadModule();
    expect(module.getVideoParserHttpBaseUrl()).toBe('https://api.example.com');
  });

  it('uses explicit WS URL from env', async () => {
    process.env.EXPO_PUBLIC_VIDEO_PARSER_WS_URL = 'wss://api.example.com/ws';
    const module = await loadModule();
    expect(module.getVideoParserWsUrl('/ignored')).toBe('wss://api.example.com/ws');
  });

  it('uses env host and port overrides', async () => {
    process.env.EXPO_PUBLIC_VIDEO_PARSER_HOST = '192.168.1.30';
    process.env.EXPO_PUBLIC_VIDEO_PARSER_PORT = '4321';
    const module = await loadModule();

    expect(module.getVideoParserHttpBaseUrl()).toBe('http://192.168.1.30:4321');
    expect(module.getVideoParserWsUrl('socket')).toBe('ws://192.168.1.30:4321/socket');
  });

  it('extracts non-loopback runtime host from expoConfig.hostUri', async () => {
    const module = await loadModule({
      constants: {
        expoConfig: { hostUri: '10.0.0.7:8081' },
      },
    });

    expect(module.getVideoParserHttpBaseUrl()).toBe('http://10.0.0.7:3000');
  });

  it('extracts runtime host from dev client deep link url param', async () => {
    const module = await loadModule({
      constants: {
        linkingUri:
          'dekin://expo-development-client/?url=http%3A%2F%2F192.168.10.9%3A8081',
      },
    });

    expect(module.getVideoParserHttpBaseUrl()).toBe('http://192.168.10.9:3000');
  });

  it('falls back to localhost on iOS and 10.0.2.2 on Android', async () => {
    const iosModule = await loadModule({ platform: 'ios' });
    const androidModule = await loadModule({ platform: 'android' });

    expect(iosModule.getVideoParserHttpBaseUrl()).toBe('http://localhost:3000');
    expect(androidModule.getVideoParserHttpBaseUrl()).toBe('http://10.0.2.2:3000');
  });
});
