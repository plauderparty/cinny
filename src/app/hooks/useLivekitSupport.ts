import { useEffect, useState } from 'react';
import { useAutoDiscoveryInfo } from './useAutoDiscoveryInfo';
import { useMatrixClient } from './useMatrixClient';
import {
  fetchRtcTransports,
  hasLivekitTransport,
  rtcFociFromWellKnown,
} from '../plugins/call/rtcTransports';

/** LiveKit via .well-known or MSC4143 `/rtc/transports`. */
export const useLivekitSupport = (): boolean => {
  const discovery = useAutoDiscoveryInfo();
  const mx = useMatrixClient();
  const fromWellKnown = hasLivekitTransport(rtcFociFromWellKnown(discovery));
  const [fromEndpoint, setFromEndpoint] = useState(false);

  useEffect(() => {
    if (fromWellKnown) return undefined;

    let cancelled = false;
    fetchRtcTransports(mx).then((transports) => {
      if (!cancelled && hasLivekitTransport(transports)) {
        setFromEndpoint(true);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [mx, fromWellKnown]);

  return fromWellKnown || fromEndpoint;
};
