import { useEffect, useState } from 'react';

import { createInitialChannels, createNextMockChannels } from '../services/MockSignalService';

export function useMockSignalFeed(isEnabled: boolean) {
  const [channels, setChannels] = useState(createInitialChannels);

  useEffect(() => {
    if (!isEnabled) {
      return;
    }

    let tick = 0;
    const intervalId = setInterval(() => {
      tick += 1;
      setChannels((currentChannels) => createNextMockChannels(currentChannels, tick));
    }, 120);

    return () => clearInterval(intervalId);
  }, [isEnabled]);

  return channels;
}
