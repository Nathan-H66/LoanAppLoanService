import { app, HttpRequest, HttpResponseInit } from '@azure/functions';
import { createLoan } from '../app/create-loan';
import { CosmosLoanRepo } from '../infra/cosmos-loan-repo';
import { CosmosDeviceRepo } from '../infra/cosmos-device-repo';
import { OAuth2Validator } from '../infra/oauth2-validator';

const createLoanHandler = async (
  request: HttpRequest
): Promise<HttpResponseInit> => {
  try {
    const body = (await request.json()) as any;

    // Validate required fields
    if (!body || typeof body !== 'object') {
      return {
        status: 400,
        jsonBody: {
          success: false,
          message: 'Request body is required',
        },
      };
    }

    const { id, deviceId, deviceName, user } = body;
    if (!id || !deviceId || !deviceName || !user) {
      return {
        status: 400,
        jsonBody: {
          success: false,
          message: 'Missing required fields: id, deviceId, deviceName, user',
        },
      };
    }

    const authValidator = new OAuth2Validator({
      jwksUri: process.env.OAUTH2_JWKS_URI!,
      issuer: process.env.OAUTH2_ISSUER!,
      audience: process.env.OAUTH2_AUDIENCE!,
    });
    const authContext = await authValidator.validate(request);
    const loanRepo = new CosmosLoanRepo({
      endpoint: process.env.COSMOS_DB_ENDPOINT!,
      key: process.env.COSMOS_DB_KEY!,
      databaseId: process.env.COSMOS_DB_DATABASE_ID || 'loans',
      containerId: process.env.COSMOS_DB_CONTAINER_ID || 'loans',
    });
    const deviceRepo = new CosmosDeviceRepo();
    const loan = await createLoan(body, loanRepo, deviceRepo, authContext);
    return {
      status: 201,
      jsonBody: { success: true, data: loan },
    };
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

app.http('createLoanHttp', {
  methods: ['POST'],
  authLevel: 'function',
  route: 'create-loan',
  handler: createLoanHandler,
});
