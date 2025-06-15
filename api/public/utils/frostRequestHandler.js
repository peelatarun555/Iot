"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const https_1 = __importDefault(require("https"));
class FrostRequestHandler {
    serverUrl = "https://api.eotlab.uni-koblenz.de/FROST-Server/v1.1/";
    authUrl = "https://auth.eotlab.uni-koblenz.de/realms/eotlab/protocol/openid-connect/token";
    clientId = "frost";
    clientSecret = "QMFeIzzUeTkgRIRek1zKMlSPN9goEpGn";
    scope = "openid";
    username = "tpeela@uni-koblenz.de";
    password = "Sasipeela@123";
    verifySsl = true;
    agent = new https_1.default.Agent({ rejectUnauthorized: this.verifySsl });
    _accessToken = null;
    _expiresAt = 0;
    isTokenExpired() {
        return Date.now() > (this._expiresAt - 60000);
    }
    async obtainToken() {
        try {
            const response = await axios_1.default.post(this.authUrl, new URLSearchParams({
                grant_type: "password",
                client_id: this.clientId,
                client_secret: this.clientSecret,
                username: this.username,
                password: this.password,
                scope: this.scope,
            }));
            this._accessToken = response.data.access_token;
            this._expiresAt = Date.now() + (response.data.expires_in * 1000);
        }
        catch (error) {
            throw new Error("Failed to obtain token: " + error.message);
        }
    }
    async ensureToken() {
        if (!this._accessToken || this.isTokenExpired()) {
            await this.obtainToken();
        }
    }
    async getRequest(path) {
        await this.ensureToken();
        try {
            return await axios_1.default.get(this.serverUrl + path, {
                headers: {
                    Authorization: `Bearer ${this._accessToken}`,
                    Accept: "application/json",
                },
                httpsAgent: this.agent,
            });
        }
        catch (error) {
            throw new Error("GET request failed: " + error.message);
        }
    }
    async postRequest(path, data) {
        await this.ensureToken();
        try {
            return await axios_1.default.post(this.serverUrl + path, data, {
                headers: {
                    Authorization: `Bearer ${this._accessToken}`,
                    Accept: "application/json",
                },
                httpsAgent: this.agent,
            });
        }
        catch (error) {
            throw new Error("POST request failed: " + error.message);
        }
    }
}
exports.default = FrostRequestHandler;
