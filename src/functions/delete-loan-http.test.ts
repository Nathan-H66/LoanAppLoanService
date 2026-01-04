import { describe, it, expect, vi, beforeEach } from 'vitest';

import { deleteLoanHandler } from './delete-loan-http';
import { CosmosLoanRepo } from '../infra/cosmos-loan-repo';

vi.mock('../infra/cosmos-loan-repo');

const mockDelete = vi.fn();
(CosmosLoanRepo as any).mockImplementation(function () {
  return { delete: mockDelete };
});

describe('deleteLoanHandler', () => {
  beforeEach(() => {
    mockDelete.mockReset();
  });

  it('returns 204 on successful delete', async () => {
    mockDelete.mockResolvedValueOnce(undefined);
    const req = { params: { id: 'loan-1' } } as any;
    const res = await deleteLoanHandler(req);
    expect(res.status).toBe(204);
  });

  it('returns 400 if id is missing', async () => {
    const req = { params: {} } as any;
    const res = await deleteLoanHandler(req);
    expect(res.status).toBe(400);
    expect(res.jsonBody.message).toMatch(/Loan id is required/);
  });

  it('returns 500 on repo error', async () => {
    mockDelete.mockRejectedValueOnce(new Error('fail'));
    const req = { params: { id: 'loan-2' } } as any;
    const res = await deleteLoanHandler(req);
    expect(res.status).toBe(500);
    expect(res.jsonBody.error).toMatch(/fail/);
  });
});
