import { app, HttpRequest, HttpResponseInit } from '@azure/functions';
import { deleteLoan } from '../app/delete-loan';
import { CosmosLoanRepo } from '../infra/cosmos-loan-repo';

const deleteLoanHandler = async (
  request: HttpRequest
): Promise<HttpResponseInit> => {
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
  authLevel: 'function',
  route: 'loans/{id}',
  handler: deleteLoanHandler,
});
