import { Device, DeviceRepo } from '../domain/device-repo';
import { CosmosClient } from '@azure/cosmos';

export class CosmosDeviceRepo implements DeviceRepo {
  private container;

  constructor() {
    const endpoint = process.env.COSMOS_DB_ENDPOINT;
    const key = process.env.COSMOS_DB_KEY;
    const databaseId = process.env.COSMOS_DB_DATABASE_ID || 'devices';
    const containerId = process.env.COSMOS_DB_CONTAINER_ID || 'devices';
    const client = new CosmosClient({ endpoint, key });
    this.container = client.database(databaseId).container(containerId);
  }

  async getDeviceById(id: string): Promise<Device | null> {
    try {
      const { resource } = await this.container.item(id, id).read<Device>();
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
