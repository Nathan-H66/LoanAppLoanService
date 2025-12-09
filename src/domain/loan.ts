//Loan Type Definition
export type Loan = {
    id: string;
    deviceId: string;
    deviceName: string;
    loanStartDate: Date;
    loanDueDate: Date;
}

// Parameter object type for loan creation
export type LoanParams = {
    id: string;
    deviceId: string;
    deviceName: string;
    loanStartDate: Date;
    loanDueDate: Date;
};

export class LoanError extends Error {
    constructor(public field: string, message: string) {
        super(message);
        this.name = 'LoanError';
    }
}

// Factory function to create a Loan with validation
export function createLoan(params: LoanParams): Loan {
    const { id, deviceId, deviceName, loanStartDate, loanDueDate } = params;

    if (!id || typeof id !== 'string') {
        throw new LoanError('id', 'Loan id is required and must be a string.');
    }
    if (!deviceId || typeof deviceId !== 'string') {
        throw new LoanError('deviceId', 'Device id is required and must be a string.');
    }
    if (!deviceName || typeof deviceName !== 'string') {
        throw new LoanError('deviceName', 'Device name is required and must be a string.');
    }
    if (!(loanStartDate instanceof Date) || isNaN(loanStartDate.getTime())) {
        throw new LoanError('loanStartDate', 'Loan start date is required and must be a valid Date.');
    }
    if (!(loanDueDate instanceof Date) || isNaN(loanDueDate.getTime())) {
        throw new LoanError('loanDueDate', 'Loan due date is required and must be a valid Date.');
    }
    if (loanDueDate.getTime() < loanStartDate.getTime()) {
        throw new LoanError('loanDueDate', 'Loan due date must be the same or after the start date.');
    }

    return Object.freeze({
        id,
        deviceId,
        deviceName,
        loanStartDate,
        loanDueDate,
    });
}