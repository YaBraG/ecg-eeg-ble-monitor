export type BleStatus = 'mock' | 'unavailable' | 'ready' | 'scanning' | 'connected' | 'error';

export type BleDeviceInfo = {
  id: string;
  name: string;
  rssi?: number | null;
};
