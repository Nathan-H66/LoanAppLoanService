import { app, HttpRequest, HttpResponseInit } from '@azure/functions';
import { deleteLoan } from '../app/delete-loan';
import { CosmosLoanRepo } from '../infra/cosmos-loan-repo';
import { getAuthValidator } from '../config/appServices';

export const deleteLoanHandler = async (
  request: HttpRequest
): Promise<HttpResponseInit> => {
  const authValidator = getAuthValidator();
  const authContext = authValidator
    ? await authValidator.validate(request)
    : undefined;
  if (!authContext?.authenticated) {
    return {
      status: 401,
      jsonBody: {
        success: false,
        error: 'Unauthorized: authentication required.',
      },
    };
  }
  const hasDeleteLoan =
    Array.isArray(authContext.permissions) &&
    authContext.permissions.includes('delete:loans');
  const isStaff =
    Array.isArray(authContext.roles) && authContext.roles.includes('Staff');
  if (!hasDeleteLoan) {
    return {
      status: 403,
      jsonBody: {
        success: false,
        error: 'Forbidden: missing delete:loans permission.',
      },
    };
  }
  if (!isStaff) {
    return {
      status: 403,
      jsonBody: { success: false, error: 'Forbidden: Staff role required.' },
    };
  }
  const id = request.params['id'];
  if (!id) {
    return {
      status: 400,
      jsonBody: { success: false, message: 'Loan id is required.' },
    };
  }
  try {
    const loanRepo = new CosmosLoanRepo({
      endpoint: process.env.COSMOS_DB_ENDPOINT!,
      key: process.env.COSMOS_DB_KEY!,
      databaseId: process.env.COSMOS_DB_DATABASE_ID || 'loans-db',
      containerId: process.env.COSMOS_DB_CONTAINER_ID || 'loans',
    });
    await deleteLoan(id, loanRepo);
    return { status: 204 };
  } catch (error) {
    return {
      status: 500,
      jsonBody: {
        success: false,
        message: 'Internal server error',
        error: (error as Error).message,
      },
    };
  }
};

app.http('deleteLoanHttp', {
  methods: ['DELETE'],
  authLevel: 'anonymous',
  route: 'loans/{id}',
  handler: deleteLoanHandler,
});
