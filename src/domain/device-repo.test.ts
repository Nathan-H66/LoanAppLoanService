import { describe, it, expect } from 'vitest';
import { DeviceRepo, Device } from './device-repo';

describe('DeviceRepo interface', () => {
  it('can be implemented with getDeviceById', async () => {
    class FakeDeviceRepo implements DeviceRepo {
      async getDeviceById(id: string): Promise<Device | null> {
        if (id === 'exists') return { id, name: 'Test', quantity: 2 };
        return null;
      }
    }
    const repo = new FakeDeviceRepo();
    expect(await repo.getDeviceById('exists')).toEqual({
      id: 'exists',
      name: 'Test',
      quantity: 2,
    });
    expect(await repo.getDeviceById('missing')).toBeNull();
  });
});
