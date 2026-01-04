import { describe, it, expect, vi, beforeEach } from 'vitest';

// Setup CosmosClient mock before importing CosmosDeviceRepo
const mockRead = vi.fn();
const mockContainer = {
  item: vi.fn().mockReturnValue({ read: mockRead }),
};
const mockDatabase = {
  container: vi.fn().mockReturnValue(mockContainer),
};
vi.mock('@azure/cosmos', () => ({
  CosmosClient: vi.fn().mockImplementation(function () {
    return {
      database: () => ({
        container: () => mockContainer,
      }),
    };
  }),
}));

import { CosmosDeviceRepo } from './cosmos-device-repo';

describe('CosmosDeviceRepo', () => {
  beforeEach(() => {
    process.env.COSMOS_DB_ENDPOINT = 'http://localhost:1234';
    process.env.COSMOS_DB_KEY = 'fake-key';
    process.env.COSMOS_DB_DATABASE_ID = 'test-db';
    process.env.COSMOS_DB_CONTAINER_ID = 'test-container';
    mockRead.mockReset();
    mockContainer.item.mockReset();
  });
  it('returns device if found', async () => {
    mockRead.mockResolvedValue({
      resource: { id: '1', name: 'Laptop', quantity: 2 },
    });
    mockContainer.item.mockReturnValue({ read: mockRead });
    const repo = new CosmosDeviceRepo();
    const device = await repo.getDeviceById('1');
    expect(device).toEqual({ id: '1', name: 'Laptop', quantity: 2 });
  });

  it('returns null if not found', async () => {
    mockRead.mockResolvedValue({ resource: null });
    mockContainer.item.mockReturnValue({ read: mockRead });
    const repo = new CosmosDeviceRepo();
    const device = await repo.getDeviceById('notfound');
    expect(device).toBeNull();
  });
});
