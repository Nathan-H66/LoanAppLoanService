import { deleteLoan } from '../app/delete-loan';
import { CosmosLoanRepo } from '../infra/cosmos-loan-repo';

export default async function (context: any, req: any) {
  const id = req.params.id;
  if (!id) {
    context.res = { status: 400, body: { error: 'Loan id is required.' } };
    return;
  }
  try {
    const loanRepo = new CosmosLoanRepo({
      endpoint: process.env.COSMOS_DB_ENDPOINT!,
      key: process.env.COSMOS_DB_KEY!,
      databaseId: process.env.COSMOS_DB_DATABASE_ID || 'loans',
      containerId: process.env.COSMOS_DB_CONTAINER_ID || 'loans',
    });
    await deleteLoan(id, loanRepo);
    context.res = { status: 204 };
  } catch (err: any) {
    context.res = { status: 500, body: { error: err.message } };
  }
}
