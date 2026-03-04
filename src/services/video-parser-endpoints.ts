import Constants from 'expo-constants';
import { Platform } from 'react-native';

const DEFAULT_PORT = '3000';
const LOCALHOST_HOST = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
const LOOPBACK_HOSTS = new Set(['localhost', '127.0.0.1', '::1']);

function parseHostname(value: string | null | undefined): string | null {
  if (!value) return null;

  const trimmed = value.trim();
  if (!trimmed) return null;

  // Accept either full URL (exp://, http://, ws://) or raw host:port.
  const withoutScheme = trimmed.replace(/^[a-z][a-z0-9+.-]*:\/\//i, '');
  const authority = withoutScheme.split('/')[0];
  if (!authority) return null;

  const ipv6Match = authority.match(/^\[([^\]]+)\]/);
  if (ipv6Match?.[1]) return ipv6Match[1];

  return authority.split(':')[0] || null;
}

function resolveRuntimeHost(): string | null {
  const candidates = [
    Constants.expoConfig?.hostUri,
    Constants.expoGoConfig?.debuggerHost,
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
  return value.replace(/\/+$/, '');
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

export function getVideoParserHttpBaseUrl(): string {
  const explicitBaseUrl = process.env.EXPO_PUBLIC_VIDEO_PARSER_BASE_URL?.trim();
  if (explicitBaseUrl) return trimTrailingSlash(explicitBaseUrl);

  const host = resolveHost();
  const port = resolvePort();
  return `http://${host}:${port}`;
}

export function getVideoParserWsUrl(path = '/ws'): string {
  const explicitWsUrl = process.env.EXPO_PUBLIC_VIDEO_PARSER_WS_URL?.trim();
  if (explicitWsUrl) return explicitWsUrl;

  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const host = resolveHost();
  const port = resolvePort();
  return `ws://${host}:${port}${normalizedPath}`;
}

