import Constants from 'expo-constants';
import { Platform } from 'react-native';

const DEFAULT_PORT = '3000';
const DEFAULT_ANDROID_EMULATOR_HOST = ['10', '0', '2', '2'].join('.');
const LOOPBACK_IPV4 = ['127', '0', '0', '1'].join('.');
const DEFAULT_HTTP_SCHEME = 'http';
const DEFAULT_WS_SCHEME = 'ws';
const LOCALHOST_HOST =
  Platform.OS === 'android'
    ? process.env.EXPO_PUBLIC_VIDEO_PARSER_ANDROID_HOST?.trim() ||
      DEFAULT_ANDROID_EMULATOR_HOST
    : 'localhost';
const LOOPBACK_HOSTS = new Set(['localhost', LOOPBACK_IPV4, '::1']);

function tryParseUrl(value: string): URL | null {
  try {
    return new URL(value);
  } catch {
    return null;
  }
}

function parseHostname(value: string | null | undefined): string | null {
  if (!value) return null;

  const trimmed = value.trim();
  if (!trimmed) return null;

  const parsedUrl = tryParseUrl(trimmed);
  if (parsedUrl?.hostname) return parsedUrl.hostname;

  // Accept raw host:port values (without a URL scheme).
  const authority = trimmed.split('/')[0];
  if (!authority) return null;

  const ipv6Match = authority.match(/^\[([^\]]+)\]/);
  if (ipv6Match?.[1]) return ipv6Match[1];

  return authority.split(':')[0] || null;
}

function parseExpoDevClientHost(value: string | null | undefined): string | null {
  if (!value) return null;

  const parsed = tryParseUrl(value);
  if (!parsed) return null;

  // Expo dev client deep-links can look like:
  // dekin://expo-development-client/?url=<encoded-bundler-url>
  const nestedBundleUrl = parsed.searchParams.get('url');
  if (nestedBundleUrl) {
    return parseHostname(nestedBundleUrl);
  }

  return null;
}

function resolveRuntimeHost(): string | null {
  const constantsWithManifest = Constants as typeof Constants & {
    manifest2?: {
      extra?: {
        expoClient?: {
          hostUri?: string | null;
        };
      };
    };
  };

  const candidates = [
    Constants.expoConfig?.hostUri,
    Constants.expoGoConfig?.debuggerHost,
    constantsWithManifest.manifest2?.extra?.expoClient?.hostUri,
    parseExpoDevClientHost(Constants.linkingUri),
    Constants.linkingUri,
  ];

  for (const candidate of candidates) {
    const host = parseHostname(candidate);
    if (host && !LOOPBACK_HOSTS.has(host)) {
      return host;
    }
  }

  return null;
}

function trimTrailingSlash(value: string): string {
  let end = value.length;
  while (end > 0 && value.charCodeAt(end - 1) === 47) {
    end -= 1;
  }

  return end === value.length ? value : value.slice(0, end);
}

function resolveHost(): string {
  const envHost = parseHostname(process.env.EXPO_PUBLIC_VIDEO_PARSER_HOST);
  if (envHost) return envHost;

  return resolveRuntimeHost() ?? LOCALHOST_HOST;
}

function resolvePort(): string {
  const envPort = process.env.EXPO_PUBLIC_VIDEO_PARSER_PORT?.trim();
  return envPort && envPort.length > 0 ? envPort : DEFAULT_PORT;
}

function resolveHttpScheme(): string {
  const envScheme = process.env.EXPO_PUBLIC_VIDEO_PARSER_HTTP_SCHEME?.trim();
  if (envScheme === 'https') return 'https';
  return DEFAULT_HTTP_SCHEME;
}

function resolveWsScheme(): string {
  const envScheme = process.env.EXPO_PUBLIC_VIDEO_PARSER_WS_SCHEME?.trim();
  if (envScheme === 'wss') return 'wss';
  if (envScheme === 'ws') return 'ws';
  return DEFAULT_WS_SCHEME;
}

export function getVideoParserHttpBaseUrl(): string {
  const explicitBaseUrl = process.env.EXPO_PUBLIC_VIDEO_PARSER_BASE_URL?.trim();
  if (explicitBaseUrl) return trimTrailingSlash(explicitBaseUrl);

  const host = resolveHost();
  const port = resolvePort();
  return `${resolveHttpScheme()}://${host}:${port}`;
}

export function getVideoParserWsUrl(path = '/ws'): string {
  const explicitWsUrl = process.env.EXPO_PUBLIC_VIDEO_PARSER_WS_URL?.trim();
  if (explicitWsUrl) return explicitWsUrl;

  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const host = resolveHost();
  const port = resolvePort();
  return `${resolveWsScheme()}://${host}:${port}${normalizedPath}`;
}
