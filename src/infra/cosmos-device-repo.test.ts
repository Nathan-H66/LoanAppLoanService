import { describe, it, expect, vi } from 'vitest';
import { CosmosDeviceRepo } from './cosmos-device-repo';
import { CosmosClient } from '@azure/cosmos';
vi.mock('@azure/cosmos');

describe('CosmosDeviceRepo', () => {
  it('returns device if found', async () => {
    const mockRead = vi.fn().mockResolvedValue({
      resource: { id: '1', name: 'Laptop', quantity: 2 },
    });
    const mockContainer = {
      item: vi.fn().mockReturnValue({ read: mockRead }),
    };
    const mockDatabase = {
      container: vi.fn().mockReturnValue(mockContainer),
    };
    (CosmosClient as any).mockImplementation(() => ({
      database: () => mockDatabase,
    }));

    const repo = new CosmosDeviceRepo();
    const device = await repo.getDeviceById('1');
    expect(device).toEqual({ id: '1', name: 'Laptop', quantity: 2 });
  });

  it('returns null if not found', async () => {
    const mockRead = vi.fn().mockResolvedValue({ resource: null });
    const mockContainer = {
      item: vi.fn().mockReturnValue({ read: mockRead }),
    };
    const mockDatabase = {
      container: vi.fn().mockReturnValue(mockContainer),
    };
    (CosmosClient as any).mockImplementation(() => ({
      database: () => mockDatabase,
    }));

    const repo = new CosmosDeviceRepo();
    const device = await repo.getDeviceById('notfound');
    expect(device).toBeNull();
  });
});
