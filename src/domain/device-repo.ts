export interface Device {
  id: string;
  name: string;
  quantity: number;
}

export interface DeviceRepo {
  getDeviceById(id: string): Promise<Device | null>;
}
