import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";

export async function httpTrigger1(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    context.log(`Http function processed request for url "${request.url}"`);

    const name = request.query.get('name') || await request.text() || 'World';

    return { 
        body: `Hello, ${name}! Welcome to Career Canvas API.`,
        headers: {
            'Content-Type': 'application/json'
        }
    };
}

app.http('hello', {
    methods: ['GET', 'POST'],
    authLevel: 'anonymous',
    handler: httpTrigger1
});