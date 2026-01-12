import { app, HttpRequest, HttpResponseInit } from '@azure/functions';

const healthHandler = async (
  _request: HttpRequest
): Promise<HttpResponseInit> => {
  return {
    status: 200,
    jsonBody: {
      success: true,
      status: 'healthy',
      timestamp: new Date().toISOString(),
    },
  };
};

app.http('healthHttp', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'health',
  handler: healthHandler,
});
