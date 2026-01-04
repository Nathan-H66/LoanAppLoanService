import { describe, it, expect, vi } from 'vitest';
import { deleteLoan } from './delete-loan';

const makeRepo = () => {
  const deleted: string[] = [];
  return {
    deleted,
    repo: {
      delete: vi.fn(async (id: string) => {
        deleted.push(id);
      }),
    },
  };
};

describe('deleteLoan', () => {
  it('deletes a loan by id', async () => {
    const { repo, deleted } = makeRepo();
    await deleteLoan('loan-123', repo as any);
    expect(deleted).toContain('loan-123');
  });

  it('throws if id is missing', async () => {
    const { repo } = makeRepo();
    await expect(deleteLoan('', repo as any)).rejects.toThrow(
      'Loan id is required and must be a string.'
    );
    await expect(deleteLoan(undefined as any, repo as any)).rejects.toThrow(
      'Loan id is required and must be a string.'
    );
  });
});
