import { useCallback, useMemo, useState } from 'react';

import { ESP32_DEVICE_NAME_PREFIX } from '../constants/ble';
import {
  connectToDevice,
  disconnectFromDevice,
  startDeviceScan,
  stopDeviceScan,
} from '../services/BleService';
import { BleDeviceInfo, BleStatus } from '../types/ble';

const MOCK_DEVICE: BleDeviceInfo = {
  id: 'mock-esp32-device',
  name: `${ESP32_DEVICE_NAME_PREFIX}-MOCK`,
  isLikelyEsp32: true,
  rssi: -42,
};

export function useBleConnection() {
  const [isMockMode, setIsMockMode] = useState(true);
  const [status, setStatus] = useState<BleStatus>('mock');
  const [devices, setDevices] = useState<BleDeviceInfo[]>([]);
  const [connectedDevice, setConnectedDevice] = useState<BleDeviceInfo | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const visibleStatus = useMemo<BleStatus>(() => {
    if (connectedDevice) {
      return 'connected';
    }

    if (status === 'scanning' || status === 'error' || status === 'unavailable') {
      return status;
    }

    return isMockMode ? 'mock' : status;
  }, [connectedDevice, isMockMode, status]);

  const addDevice = useCallback((nextDevice: BleDeviceInfo) => {
    setDevices((currentDevices) => {
      if (currentDevices.some((device) => device.id === nextDevice.id)) {
        return currentDevices;
      }

      return [...currentDevices, nextDevice].sort((leftDevice, rightDevice) => {
        if (leftDevice.isLikelyEsp32 === rightDevice.isLikelyEsp32) {
          return 0;
        }

        return leftDevice.isLikelyEsp32 ? -1 : 1;
      });
    });
  }, []);

  const startScan = useCallback(async () => {
    setErrorMessage(null);
    setDevices([]);
    setStatus('scanning');

    if (isMockMode) {
      setTimeout(() => {
        addDevice(MOCK_DEVICE);
        setStatus('mock');
      }, 500);
      return;
    }

    try {
      await startDeviceScan(addDevice);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to start BLE scan.';
      setErrorMessage(message);
      setStatus(message.toLowerCase().includes('unavailable') ? 'unavailable' : 'error');
    }
  }, [addDevice, isMockMode]);

  const stopScan = useCallback(() => {
    if (!isMockMode) {
      stopDeviceScan();
    }

    setStatus(isMockMode ? 'mock' : 'ready');
  }, [isMockMode]);

  const connect = useCallback(
    async (device: BleDeviceInfo) => {
      setErrorMessage(null);

      if (isMockMode || device.id === MOCK_DEVICE.id) {
        setConnectedDevice(device);
        setStatus('connected');
        return;
      }

      try {
        const connected = await connectToDevice(device.id);
        setConnectedDevice(connected);
        setStatus('connected');
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : 'Unable to connect to device.');
        setStatus('error');
      }
    },
    [isMockMode],
  );

  const disconnect = useCallback(async () => {
    setErrorMessage(null);

    try {
      if (!isMockMode) {
        await disconnectFromDevice();
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to disconnect cleanly.');
      setStatus('error');
      return;
    }

    setConnectedDevice(null);
    setStatus(isMockMode ? 'mock' : 'ready');
  }, [isMockMode]);

  const toggleMockMode = useCallback(
    (nextValue: boolean) => {
      stopDeviceScan();
      setIsMockMode(nextValue);
      setConnectedDevice(null);
      setDevices([]);
      setErrorMessage(null);
      setStatus(nextValue ? 'mock' : 'ready');
    },
    [],
  );

  return {
    connectedDevice,
    devices,
    errorMessage,
    isMockMode,
    status: visibleStatus,
    connect,
    disconnect,
    setIsMockMode: toggleMockMode,
    startScan,
    stopScan,
  };
}
