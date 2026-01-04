import { app, HttpRequest, HttpResponseInit } from '@azure/functions';
import { createLoan } from '../app/create-loan';
import { CosmosLoanRepo } from '../infra/cosmos-loan-repo';
import { CosmosDeviceRepo } from '../infra/cosmos-device-repo';
import { getDeviceRepo } from '../config/appServices';
import { getAuthValidator } from '../config/appServices';

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

    const authValidator = getAuthValidator();
    const authContext = authValidator
      ? await authValidator.validate(request)
      : undefined;
    const loanRepo = new CosmosLoanRepo({
      endpoint: process.env.COSMOS_DB_ENDPOINT!,
      key: process.env.COSMOS_DB_KEY!,
      databaseId: process.env.COSMOS_DB_DATABASE_ID || 'loans-db',
      containerId: process.env.COSMOS_DB_CONTAINER_ID || 'loans',
    });
    const deviceRepo = getDeviceRepo();
    if (!deviceRepo) {
      return {
        status: 500,
        jsonBody: {
          success: false,
          message: 'Device repository not configured.',
        },
      };
    }
    const loan = await createLoan(body, loanRepo, deviceRepo, authContext);
    return {
      status: 201,
      jsonBody: { success: true, data: loan },
    };
  } catch (error) {
    // Log the full error to the console for debugging
    console.error('createLoanHandler error:', error);
    return {
      status: 500,
      jsonBody: {
        success: false,
        message: 'Internal server error',
        error:
          error instanceof Error ? error.stack || error.message : String(error),
      },
    };
  }
};

app.http('createLoanHttp', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'create-loan',
  handler: createLoanHandler,
});
