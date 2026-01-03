import type { Loan } from './loan';

export interface LoanRepo {
  // Handles creating and saving a new loan
  save(loan: Loan): Promise<void>;
  // Retrieves a loan by its ID, returning null if not found
  getById(id: string): Promise<Loan | null>;
  // Lists all loans in the repository
  list(): Promise<Loan[]>;
  // Removes a loan by its ID
  delete(id: string): Promise<void>;
}
