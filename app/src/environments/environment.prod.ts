export const environment = {
    PRODUCTION: true,
    API_URL: window.__env?.['API_URL'] ?? 'http://host.docker.internal:3000',
    API_ENDPOINT: '/v1/restapi', 
    SOCKET_IO_ENDPOINT: '/v1/socket.io', 
