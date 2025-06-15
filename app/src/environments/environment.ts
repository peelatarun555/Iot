// The file contents for the current environment might overwrite these during build.
// The build system defaults to the dev environment which uses this `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// `dev-local` uses a generated `environment.local.ts` via 'set-local-env.mjs'.
// The list of which env maps to which file can be found in `angular.json`.

// Environment variable that need to be accessible during **runtime** need to be
// added to `runtime-env.template.js` to be accessible via window.__env.
export const environment = {
    PRODUCTION: false,
    API_URL: window.__env?.['API_URL'] ?? 'http://localhost:3000',
    API_ENDPOINT: '/v1/restapi',
    SOCKET_IO_ENDPOINT: '/v1/socket.io',
};
