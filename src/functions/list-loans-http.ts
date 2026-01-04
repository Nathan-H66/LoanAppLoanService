import { app, HttpRequest, HttpResponseInit } from '@azure/functions';
import { listLoans } from '../app/list-loans';
import { getLoanRepo, getAuthValidator } from '../config/appServices';

const listLoansHandler = async (
  request: HttpRequest
): Promise<HttpResponseInit> => {
  try {
    const authValidator = getAuthValidator();
    const authContext = authValidator
      ? await authValidator.validate(request)
      : { authenticated: false, scopes: [] };
    const loanRepo = getLoanRepo();
    if (!loanRepo) {
      return {
        status: 500,
        jsonBody: { success: false, error: 'Loan repository not configured.' },
      };
    }
    const result = await listLoans({ loanRepo, authContext });
    if (result.success) {
      return { status: 200, jsonBody: { success: true, data: result.data } };
    } else {
      return { status: 500, jsonBody: { success: false, error: result.error } };
    }
  } catch (error) {
    return {
      status: 500,
      jsonBody: {
        success: false,
        error: (error as Error).message,
      },
    };
  }
};

app.http('listLoansHttp', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'loans',
  handler: listLoansHandler,
});
