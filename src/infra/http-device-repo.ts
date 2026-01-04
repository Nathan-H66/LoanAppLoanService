import { DeviceRepo, Device } from '../domain/device-repo';

export class HttpDeviceRepo implements DeviceRepo {
  constructor(private baseUrl: string, private apiKey?: string) {}

  async getDeviceById(id: string): Promise<Device | null> {
    const url = `${this.baseUrl}/api/devices/${id}`;
    const headers: Record<string, string> = {};
    if (this.apiKey) headers['x-functions-key'] = this.apiKey;
    const res = await fetch(url, { headers });
    if (!res.ok) return null;
    return await res.json();
  }
}
