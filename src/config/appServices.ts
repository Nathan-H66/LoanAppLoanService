import { CosmosLoanRepo } from '../infra/cosmos-loan-repo';
import { CosmosDeviceRepo } from '../infra/cosmos-device-repo';
import { OAuth2Validator } from '../infra/oauth2-validator';

export const loanRepo = new CosmosLoanRepo({
  endpoint: process.env.COSMOS_DB_ENDPOINT!,
  key: process.env.COSMOS_DB_KEY!,
  databaseId: process.env.COSMOS_DB_DATABASE_ID || 'loans',
  containerId: process.env.COSMOS_DB_CONTAINER_ID || 'loans',
});
export const deviceRepo = new CosmosDeviceRepo();
export const authValidator = new OAuth2Validator({
  jwksUri: process.env.OAUTH2_JWKS_URI!,
  issuer: process.env.OAUTH2_ISSUER!,
  audience: process.env.OAUTH2_AUDIENCE!,
});
