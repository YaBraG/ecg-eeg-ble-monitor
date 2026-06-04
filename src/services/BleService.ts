import { PermissionsAndroid, Platform } from 'react-native';
import { BleManager, Device, Subscription } from 'react-native-ble-plx';

import { ESP32_DATA_CHARACTERISTIC_UUID, ESP32_SERVICE_UUID } from '../constants/ble';
import { BleDeviceInfo } from '../types/ble';

type DeviceFoundCallback = (device: BleDeviceInfo) => void;

let manager: BleManager | null = null;
let connectedDevice: Device | null = null;
let dataSubscription: Subscription | null = null;

function getManager() {
  if (!manager) {
    manager = new BleManager();
  }

  return manager;
}

export async function isBluetoothReady() {
  const state = await getManager().state();
  return state === 'PoweredOn';
}

export async function requestBlePermissions() {
  if (Platform.OS !== 'android') {
    return true;
  }

  if (Platform.Version < 31) {
    const result = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
    return result === PermissionsAndroid.RESULTS.GRANTED;
  }

  const results = await PermissionsAndroid.requestMultiple([
    PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
    PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
  ]);

  return Object.values(results).every((result) => result === PermissionsAndroid.RESULTS.GRANTED);
}

export async function startDeviceScan(onDeviceFound: DeviceFoundCallback) {
  const hasPermissions = await requestBlePermissions();

  if (!hasPermissions) {
    throw new Error('Bluetooth permissions were not granted.');
  }

  const ready = await isBluetoothReady();
  if (!ready) {
    throw new Error('Bluetooth is unavailable or powered off.');
  }

  getManager().startDeviceScan([ESP32_SERVICE_UUID], null, (error, device) => {
    if (error) {
      console.warn(error.message);
      return;
    }

    if (!device?.id) {
      return;
    }

    onDeviceFound({
      id: device.id,
      name: device.name ?? device.localName ?? 'Unnamed BLE Device',
      rssi: device.rssi,
    });
  });
}

export function stopDeviceScan() {
  getManager().stopDeviceScan();
}

export async function connectToDevice(deviceId: string) {
  const device = await getManager().connectToDevice(deviceId);
  connectedDevice = await device.discoverAllServicesAndCharacteristics();
  return {
    id: connectedDevice.id,
    name: connectedDevice.name ?? connectedDevice.localName ?? 'Connected BLE Device',
    rssi: connectedDevice.rssi,
  };
}

export async function disconnectFromDevice() {
  dataSubscription?.remove();
  dataSubscription = null;

  if (connectedDevice) {
    await getManager().cancelDeviceConnection(connectedDevice.id);
    connectedDevice = null;
  }
}

export function subscribeToSignalData(onBase64Data: (value: string) => void) {
  if (!connectedDevice) {
    throw new Error('Connect to the ESP32 before subscribing to data.');
  }

  // This subscription target uses placeholder UUIDs until the ESP32 firmware contract is finalized.
  dataSubscription = connectedDevice.monitorCharacteristicForService(
    ESP32_SERVICE_UUID,
    ESP32_DATA_CHARACTERISTIC_UUID,
    (error, characteristic) => {
      if (error) {
        console.warn(error.message);
        return;
      }

      if (characteristic?.value) {
        onBase64Data(characteristic.value);
      }
    },
  );

  return dataSubscription;
}
