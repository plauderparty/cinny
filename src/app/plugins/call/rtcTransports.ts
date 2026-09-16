import { type MatrixClient, Method } from 'matrix-js-sdk';
import type { IRtcTransport } from 'matrix-widget-api';

const RTC_TRANSPORTS_PREFIX = '/_matrix/client/unstable/org.matrix.msc4143';

export function rtcFociFromWellKnown(wellKnown: unknown): IRtcTransport[] {
  if (!wellKnown || typeof wellKnown !== 'object') return [];
  const foci = (wellKnown as { 'org.matrix.msc4143.rtc_foci'?: unknown })[
    'org.matrix.msc4143.rtc_foci'
  ];
  if (!Array.isArray(foci)) return [];
  return foci.filter(
    (f): f is IRtcTransport =>
      !!f && typeof f === 'object' && typeof (f as { type?: unknown }).type === 'string'
  );
}

export function hasLivekitTransport(transports: IRtcTransport[]): boolean {
  return transports.some(
    (t) => t.type === 'livekit' && typeof t.livekit_service_url === 'string'
  );
}

/** Authenticated MSC4143 `/rtc/transports` (empty if the homeserver lacks it). */
export async function fetchRtcTransports(mx: MatrixClient): Promise<IRtcTransport[]> {
  try {
    const { rtc_transports: transports } = await mx.http.authedRequest<{
      rtc_transports?: IRtcTransport[];
    }>(Method.Get, '/rtc/transports', undefined, undefined, {
      prefix: RTC_TRANSPORTS_PREFIX,
    });
    return Array.isArray(transports) ? transports : [];
  } catch {
    return [];
  }
}

/**
 * MSC4515 host discovery: `/rtc/transports`, then `.well-known` rtc_foci.
 */
export async function discoverRtcTransports(mx: MatrixClient): Promise<IRtcTransport[]> {
  const fromServer = await fetchRtcTransports(mx);
  if (fromServer.length > 0) return fromServer;

  const domain = mx.getDomain();
  if (!domain) return [];
  try {
    const res = await fetch(`https://${domain}/.well-known/matrix/client`);
    if (!res.ok) return [];
    return rtcFociFromWellKnown(await res.json());
  } catch {
    return [];
  }
}
