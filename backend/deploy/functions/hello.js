"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.httpTrigger1 = httpTrigger1;
const functions_1 = require("@azure/functions");
async function httpTrigger1(request, context) {
    context.log(`Http function processed request for url "${request.url}"`);
    const name = request.query.get('name') || await request.text() || 'World';
    return {
        body: `Hello, ${name}! Welcome to Career Canvas API.`,
        headers: {
            'Content-Type': 'application/json'
        }
    };
}
functions_1.app.http('hello', {
    methods: ['GET', 'POST'],
    authLevel: 'anonymous',
    handler: httpTrigger1
});
//# sourceMappingURL=hello.js.map