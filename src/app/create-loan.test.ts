import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createLoan } from './create-loan';
import type { AuthContext } from './auth-context';
import type { Device, DeviceRepo } from '../domain/device-repo';

const validDevice: Device = { id: 'dev-1', name: 'Device A', quantity: 1 };
const makeDeviceRepo = (device: Device | null): DeviceRepo => ({
  getDeviceById: vi.fn(() => Promise.resolve(device)),
});

type SavedLoan = any;
type LoanRepo = {
  save: (loan: SavedLoan) => Promise<void>;
};

let originalDate: DateConstructor;

beforeEach(() => {
  originalDate = Date;
});

afterEach(() => {
  // restore Date if a test replaced it
  (global as any).Date = originalDate;
  vi.restoreAllMocks();
});

describe('createLoan', () => {
  it('creates a loan, saves it via repo and returns a frozen loan with correct dates', async () => {
    const fakeRepo: LoanRepo = {
      save: vi.fn(() => Promise.resolve()),
    };

    // Use real dates for this happy-path test so arithmetic is real.
    const req = {
      id: 'loan-1',
      deviceId: 'dev-1',
      deviceName: 'Device A',
    };

    const deviceRepo = makeDeviceRepo(validDevice);
    const loan = await createLoan(req, fakeRepo as any, deviceRepo, {
      authenticated: true,
    } as AuthContext);

    // repo.save should have been called once with the same loan object
    expect((fakeRepo.save as any).mock.calls.length).toBe(1);
    const savedArg = (fakeRepo.save as any).mock.calls[0][0];
    expect(savedArg).toBe(loan);

    // Basic properties preserved
    expect(loan.id).toBe(req.id);
    expect(loan.deviceId).toBe(req.deviceId);
    expect(loan.deviceName).toBe(req.deviceName);

    // Dates exist and are Date-like numbers
    expect(typeof loan.loanStartDate.getTime()).toBe('number');
    expect(typeof loan.loanDueDate.getTime()).toBe('number');

    // Due date is exactly 2 days (in ms) after start date
    const diff = loan.loanDueDate.getTime() - loan.loanStartDate.getTime();
    expect(diff).toBe(2 * 24 * 60 * 60 * 1000);

    // Loan object is frozen
    expect(Object.isFrozen(loan)).toBe(true);
  });

  it('allows creation without auth context', async () => {
    const repo: LoanRepo = { save: vi.fn(() => Promise.resolve()) };
    const req = { id: 'x', deviceId: 'y', deviceName: 'z' };
    const deviceRepo = makeDeviceRepo(validDevice);
    await expect(
      createLoan(req, repo as any, deviceRepo)
    ).resolves.toHaveProperty('id', 'x');
  });

  it('throws when auth is provided but not authenticated', async () => {
    const repo: LoanRepo = { save: vi.fn(() => Promise.resolve()) };
    const req = { id: 'a', deviceId: 'b', deviceName: 'c' };
    const deviceRepo = makeDeviceRepo(validDevice);
    await expect(
      createLoan(req, repo as any, deviceRepo, {
        authenticated: false,
      } as AuthContext)
    ).rejects.toThrow('Not authenticated');
  });

  it('validates missing id', async () => {
    const repo: LoanRepo = { save: vi.fn(() => Promise.resolve()) };
    const req = { id: '', deviceId: 'b', deviceName: 'c' };
    const deviceRepo = makeDeviceRepo(validDevice);
    await expect(
      createLoan(req as any, repo as any, deviceRepo)
    ).rejects.toThrow('Loan id is required and must be a string.');
  });

  it('validates missing deviceId', async () => {
    const repo: LoanRepo = { save: vi.fn(() => Promise.resolve()) };
    const req = { id: 'id', deviceId: '' as any, deviceName: 'c' };
    const deviceRepo = makeDeviceRepo(validDevice);
    await expect(
      createLoan(req as any, repo as any, deviceRepo)
    ).rejects.toThrow('Device id is required and must be a string.');
  });

  it('validates missing deviceName', async () => {
    const repo: LoanRepo = { save: vi.fn(() => Promise.resolve()) };
    const req = { id: 'id', deviceId: 'dev', deviceName: '' as any };
    const deviceRepo = makeDeviceRepo(validDevice);
    await expect(
      createLoan(req as any, repo as any, deviceRepo)
    ).rejects.toThrow('Device name is required and must be a string.');
  });

  it('throws if computed loan dates are invalid (NaN)', async () => {
    // Fake Date so that getTime() returns NaN
    class FakeDateInvalid {
      private val: number | undefined;
      constructor(arg?: any) {
        // if constructed with a number, still make it invalid
        if (typeof arg === 'number') {
          this.val = NaN;
        } else {
          this.val = NaN;
        }
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore - provide getTime
        this.getTime = () => this.val;
      }
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      static now() {
        return NaN;
      }
    }
    (global as any).Date = FakeDateInvalid as unknown as DateConstructor;

    const repo: LoanRepo = { save: vi.fn(() => Promise.resolve()) };
    const req = { id: 'id', deviceId: 'dev', deviceName: 'name' };
    const deviceRepo = makeDeviceRepo(validDevice);
    await expect(
      createLoan(req as any, repo as any, deviceRepo)
    ).rejects.toThrow('Computed loan dates are invalid.');
  });

  it('throws when computed due date is before start date', async () => {
    // Create a Date fake where now.getTime() returns different values on successive calls.
    function installSequenceDate(values: number[]) {
      class SeqDate {
        private _args: any[];
        constructor(arg?: any) {
          this._args = Array.prototype.slice.call(arguments);
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          this.getTime = () => {
            // If constructed with a numeric argument, return that value
            if (this._args.length === 1 && typeof this._args[0] === 'number') {
              return this._args[0];
            }
            // Otherwise, pop the next value from sequence
            const next = values.shift();
            // If undefined, fallback to a stable number
            return typeof next === 'number' ? next : 0;
          };
        }
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        static now() {
          return 0;
        }
      }
      (global as any).Date = SeqDate as unknown as DateConstructor;
    }

    // first getTime() -> startTime = 1_000_000
    // second getTime() -> base for due calc = -200_000_000
    installSequenceDate([1_000_000, -200_000_000]);

    const repo: LoanRepo = { save: vi.fn(() => Promise.resolve()) };
    const req = { id: 'id', deviceId: 'dev', deviceName: 'name' };
    const deviceRepo = makeDeviceRepo(validDevice);
    await expect(
      createLoan(req as any, repo as any, deviceRepo)
    ).rejects.toThrow(
      'Loan due date must be the same or after the start date.'
    );
  });

  it('creates a loan if device is available', async () => {
    const fakeRepo: LoanRepo = { save: vi.fn(() => Promise.resolve()) };
    const req = { id: 'loan-1', deviceId: 'dev-1', deviceName: 'Device A' };
    const deviceRepo = makeDeviceRepo(validDevice);
    const loan = await createLoan(req, fakeRepo as any, deviceRepo, {
      authenticated: true,
    } as AuthContext);
    expect(loan.deviceId).toBe(req.deviceId);
    expect(fakeRepo.save).toHaveBeenCalledWith(loan);
  });

  it('denies loan if device not found', async () => {
    const fakeRepo: LoanRepo = { save: vi.fn(() => Promise.resolve()) };
    const req = { id: 'loan-2', deviceId: 'dev-404', deviceName: 'Device B' };
    const deviceRepo = makeDeviceRepo(null);
    await expect(
      createLoan(req, fakeRepo as any, deviceRepo, {
        authenticated: true,
      } as AuthContext)
    ).rejects.toThrow('Device not found');
  });

  it('denies loan if device quantity is 0', async () => {
    const fakeRepo: LoanRepo = { save: vi.fn(() => Promise.resolve()) };
    const req = { id: 'loan-3', deviceId: 'dev-0', deviceName: 'Device C' };
    const deviceRepo = makeDeviceRepo({
      ...validDevice,
      id: 'dev-0',
      quantity: 0,
    });
    await expect(
      createLoan(req, fakeRepo as any, deviceRepo, {
        authenticated: true,
      } as AuthContext)
    ).rejects.toThrow('Device is not available for loan');
  });
});
