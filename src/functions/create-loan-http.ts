import { AzureFunction, Context, HttpRequest } from '@azure/functions';
import { createLoan } from '../app/create-loan';
import { CosmosLoanRepo } from '../infra/cosmos-loan-repo';
import { CosmosDeviceRepo } from '../infra/cosmos-device-repo';
import { OAuth2Validator } from '../infra/oauth2-validator';

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  try {
    // Validate auth (if present)
    const authHeader = req.headers['authorization'] || '';
    const authContext = await new OAuth2Validator().validate(authHeader);

    // Prepare repos
    const loanRepo = new CosmosLoanRepo();
    const deviceRepo = new CosmosDeviceRepo();

    // Call use case
    const loan = await createLoan(req.body, loanRepo, deviceRepo, authContext);

    context.res = {
      status: 201,
      body: loan,
    };
  } catch (err: any) {
    context.res = {
      status: 400,
      body: { error: err.message },
    };
  }
};

export default httpTrigger;
