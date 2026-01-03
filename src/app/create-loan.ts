import type { Loan } from '../domain/loan';
import type { LoanRepo } from '../domain/loan-repo';
import type { AuthContext } from './auth-context';
import type { DeviceRepo } from '../domain/device-repo';

export type CreateLoanRequest = {
  id: string;
  deviceId: string;
  deviceName: string;
};

/**
 * Application-level use case to create a loan.
 * - Uses the current date as the start date and +2 days as the due date.
 * - Persists the loan via the provided `LoanRepo`.
 * - Performs a simple auth check if an `AuthContext` is provided.
 * - Checks device quantity via the provided `DeviceRepo`.
 */
export async function createLoan(
  req: CreateLoanRequest,
  repo: LoanRepo,
  deviceRepo: DeviceRepo,
  auth?: AuthContext
): Promise<Loan> {
  // Basic auth guard: if an auth context is provided, require it to be authenticated.
  if (auth && !auth.authenticated) {
    throw new Error('Not authenticated');
  }
  // Validate input fields (simple, same rules as domain)
  if (!req.id || typeof req.id !== 'string') {
    throw new Error('Loan id is required and must be a string.');
  }
  if (!req.deviceId || typeof req.deviceId !== 'string') {
    throw new Error('Device id is required and must be a string.');
  }
  if (!req.deviceName || typeof req.deviceName !== 'string') {
    throw new Error('Device name is required and must be a string.');
  }

  // Check device quantity
  const device = await deviceRepo.getDeviceById(req.deviceId);
  if (!device) {
    throw new Error('Device not found.');
  }
  if (device.quantity <= 0) {
    throw new Error('Device is not available for loan.');
  }

  // Create dates: start = now, due = now + 2 days
  const now = new Date();
  const loanStartDate = new Date(now.getTime());
  const loanDueDate = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);

  if (isNaN(loanStartDate.getTime()) || isNaN(loanDueDate.getTime())) {
    throw new Error('Computed loan dates are invalid.');
  }

  if (loanDueDate.getTime() < loanStartDate.getTime()) {
    throw new Error('Loan due date must be the same or after the start date.');
  }

  const loan: Loan = Object.freeze({
    id: req.id,
    deviceId: req.deviceId,
    deviceName: req.deviceName,
    loanStartDate,
    loanDueDate,
  });

  await repo.save(loan);
  return loan;
}
