import type { LoanRepo } from '../domain/loan-repo';

/**
 * Application-level use case to delete a loan by ID.
 */
export async function deleteLoan(id: string, repo: LoanRepo): Promise<void> {
  if (!id || typeof id !== 'string') {
    throw new Error('Loan id is required and must be a string.');
  }
  await repo.delete(id);
}
