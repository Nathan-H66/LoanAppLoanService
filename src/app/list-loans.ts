import type { Loan } from '../domain/loan';
import type { LoanRepo } from '../domain/loan-repo';
import type { AuthContext } from './auth-context';

export type ListLoansDeps = {
  loanRepo: LoanRepo;
  authContext: AuthContext;
};

// DTO for listing loans
export type LoanListItem = {
  id: string;
  deviceId: string;
  deviceName: string;
  loanStartDate: string;
  loanDueDate: string;
  user: string;
};

export type ListLoansResult = {
  success: boolean;
  data?: LoanListItem[];
  error?: string;
};

/**
 * Use-case for listing loans.
 * Usage:
 *   const result = await listLoans({ loanRepo, authContext });
 */
export async function listLoans(deps: ListLoansDeps): Promise<ListLoansResult> {
  const { loanRepo, authContext } = deps;
  try {
    const loans = await loanRepo.list();
    // Map loans to DTO format
    const processedLoans: LoanListItem[] = loans.map((loan) => ({
      id: loan.id,
      deviceId: loan.deviceId,
      deviceName: loan.deviceName,
      loanStartDate: loan.loanStartDate.toISOString(),
      loanDueDate: loan.loanDueDate.toISOString(),
      user: loan.user,
    }));
    return { success: true, data: processedLoans };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}
