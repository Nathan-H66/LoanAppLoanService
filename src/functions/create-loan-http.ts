import { createLoan } from '../app/create-loan';
import { CosmosLoanRepo } from '../infra/cosmos-loan-repo';
import { CosmosDeviceRepo } from '../infra/cosmos-device-repo';
import { OAuth2Validator } from '../infra/oauth2-validator';

export default async function (context: any, req: any) {
  try {
    // Validate auth (if present)
    const authValidator = new OAuth2Validator({
      jwksUri: process.env.OAUTH2_JWKS_URI!,
      issuer: process.env.OAUTH2_ISSUER!,
      audience: process.env.OAUTH2_AUDIENCE!,
    });
    const authContext = await authValidator.validate(req);

    // Prepare repos
    const loanRepo = new CosmosLoanRepo({
      endpoint: process.env.COSMOS_DB_ENDPOINT!,
      key: process.env.COSMOS_DB_KEY!,
      databaseId: process.env.COSMOS_DB_DATABASE_ID || 'loans',
      containerId: process.env.COSMOS_DB_CONTAINER_ID || 'loans',
    });
    const deviceRepo = new CosmosDeviceRepo();

    // Parse body (if not already parsed)
    const body =
      req.body && typeof req.body === 'object'
        ? req.body
        : JSON.parse(req.rawBody || '{}');

    // Call use case
    const loan = await createLoan(body, loanRepo, deviceRepo, authContext);

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
}
