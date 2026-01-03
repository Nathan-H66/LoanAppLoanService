import { Device, DeviceRepo } from '../domain/device-repo';
import { CosmosClient } from '@azure/cosmos';

type CosmosDeviceRepoOptions = {
  endpoint: string;
  databaseId: string;
  containerId: string;
  key?: string;
};

export class CosmosDeviceRepo implements DeviceRepo {
  private container;

  constructor(options?: CosmosDeviceRepoOptions) {
    const endpoint = options?.endpoint || process.env.COSMOS_DB_ENDPOINT!;
    const key = options?.key || process.env.COSMOS_DB_KEY;
    const databaseId =
      options?.databaseId || process.env.COSMOS_DB_DATABASE_ID || 'devices';
    const containerId =
      options?.containerId || process.env.COSMOS_DB_CONTAINER_ID || 'devices';
    const client = key
      ? new CosmosClient({ endpoint, key })
      : new CosmosClient({ endpoint });
    this.container = client.database(databaseId).container(containerId);
  }

  async getDeviceById(id: string): Promise<Device | null> {
    try {
      const { resource } = await this.container.item(id, id).read();
      if (!resource) return null;
      return {
        id: resource.id,
        name: resource.name,
        quantity: resource.quantity,
      };
    } catch (err) {
      return null;
    }
  }
}
