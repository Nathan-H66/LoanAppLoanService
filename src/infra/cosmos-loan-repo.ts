import { CosmosClient, Container } from '@azure/cosmos';
import type { Loan } from '../domain/loan';
import type { LoanRepo } from '../domain/loan-repo';

type LoanDTO = {
  id: string;
  deviceId: string;
  deviceName: string;
  loanStartDate: string; // ISO string
  loanDueDate: string; // ISO string
  user: string;
};

type CosmosLoanRepoOptions = {
  endpoint: string;
  databaseId: string;
  containerId: string;
  key?: string;
};

export class CosmosLoanRepo implements LoanRepo {
  private container: Container;

  constructor(options: CosmosLoanRepoOptions) {
    const client = options.key
      ? new CosmosClient({ endpoint: options.endpoint, key: options.key })
      : new CosmosClient({ endpoint: options.endpoint });
    const db = client.database(options.databaseId);
    this.container = db.container(options.containerId);
  }

  private toDTO(loan: Loan): LoanDTO {
    return {
      id: loan.id,
      deviceId: loan.deviceId,
      deviceName: loan.deviceName,
      loanStartDate: loan.loanStartDate.toISOString(),
      loanDueDate: loan.loanDueDate.toISOString(),
      user: loan.user,
    };
  }

  private fromDTO(dto: LoanDTO): Loan {
    return {
      id: dto.id,
      deviceId: dto.deviceId,
      deviceName: dto.deviceName,
      loanStartDate: new Date(dto.loanStartDate),
      loanDueDate: new Date(dto.loanDueDate),
      user: dto.user,
    };
  }

  async save(loan: Loan): Promise<void> {
    const dto = this.toDTO(loan);
    await this.container.items.upsert(dto);
  }

  async getById(id: string): Promise<Loan | null> {
    try {
      const { resource } = await this.container.item(id, id).read<LoanDTO>();
      return resource ? this.fromDTO(resource) : null;
    } catch (err: any) {
      if (err && (err.code === 404 || err.statusCode === 404)) return null;
      throw err;
    }
  }

  async list(): Promise<Loan[]> {
    const query = 'SELECT * FROM c';
    const { resources } = await this.container.items
      .query<LoanDTO>(query)
      .fetchAll();
    return resources.map((dto) => this.fromDTO(dto));
  }

  async delete(id: string): Promise<void> {
    await this.container.item(id, id).delete();
  }
}
