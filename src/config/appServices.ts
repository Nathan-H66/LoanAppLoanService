import { CosmosLoanRepo } from '../infra/cosmos-loan-repo';
import { CosmosDeviceRepo } from '../infra/cosmos-device-repo';
import { OAuth2Validator } from '../infra/oauth2-validator';

let cachedLoanRepo: CosmosLoanRepo | null = null;
export const getLoanRepo = (): CosmosLoanRepo | null => {
  if (!cachedLoanRepo) {
    const endpoint = process.env.COSMOS_DB_ENDPOINT;
    const key = process.env.COSMOS_DB_KEY;
    const databaseId = process.env.COSMOS_DB_DATABASE_ID;
    const containerId = process.env.COSMOS_DB_CONTAINER_ID;
    if (endpoint && key && databaseId && containerId) {
      cachedLoanRepo = new CosmosLoanRepo({
        endpoint,
        key,
        databaseId,
        containerId,
      });
    }
  }
  return cachedLoanRepo;
};

let cachedDeviceRepo: CosmosDeviceRepo | null = null;
export const getDeviceRepo = (): CosmosDeviceRepo | null => {
  if (!cachedDeviceRepo) {
    const endpoint = process.env.COSMOS_DB_ENDPOINT;
    const key = process.env.COSMOS_DB_KEY;
    const databaseId = process.env.COSMOS_DB_DATABASE_ID;
    const containerId = process.env.COSMOS_DB_CONTAINER_ID;
    if (endpoint && key && databaseId && containerId) {
      cachedDeviceRepo = new CosmosDeviceRepo({
        endpoint,
        key,
        databaseId,
        containerId,
      });
    }
  }
  return cachedDeviceRepo;
};

let cachedAuthValidator: OAuth2Validator | null = null;
export const getAuthValidator = (): OAuth2Validator | null => {
  if (!cachedAuthValidator) {
    const jwksUri = process.env.OAUTH2_JWKS_URI;
    const issuer = process.env.OAUTH2_ISSUER;
    const audience = process.env.OAUTH2_AUDIENCE;
    if (jwksUri && issuer && audience) {
      cachedAuthValidator = new OAuth2Validator({ jwksUri, issuer, audience });
    }
  }
  return cachedAuthValidator;
};
