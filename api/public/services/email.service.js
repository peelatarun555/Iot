"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const enums_1 = require("@utils/enums");
const env_1 = require("@utils/env");
const logger_1 = __importDefault(require("@tightec/logger"));
const nodemailer_1 = require("nodemailer");
const localization_service_1 = __importDefault(require("./localization.service"));
class EmailService {
    locale;
    constructor(locale = enums_1.Locale.de) {
        this.locale = locale;
    }
    async sendCreateNewUserEmail(options) {
        const localizationService = new localization_service_1.default(this.locale);
        await this.sendEmail({
            to: options.email,
            subject: localizationService.translate("createUserSubject"),
            html: localizationService.translate("createUserBody", {
                email: options.email,
                name: options.name,
                password: options.passwordTmp,
            }),
        });
    }
    async sendPasswordResetEmail(options) {
        const localizationService = new localization_service_1.default(this.locale);
        await this.sendEmail({
            to: options.email,
            subject: localizationService.translate("resetPasswordSubject"),
            html: localizationService.translate("resetPasswordBody", {
                email: options.email,
                name: options.name,
                password: options.passwordTmp,
            }),
        });
    }
    async sendEmail(email, attachements) {
        if ((0, env_1.isProductionEnv)() || (0, env_1.isDevEnv)()) {
            const transporter = (0, nodemailer_1.createTransport)({
                host: env_1.env.EMAIL_SERVER_SMTP,
                port: env_1.env.EMAIL_PORT_SMTP,
                secure: (0, env_1.isProductionEnv)(),
                auth: {
                    user: env_1.env.EMAIL_ADDRESS_SMTP,
                    pass: env_1.env.EMAIL_PASSWORD_SMTP,
                },
            });
            await transporter
                .sendMail({
                from: {
                    name: "eotlab",
                    address: env_1.env.EMAIL_ADDRESS_SMTP,
                },
                to: email.to,
                subject: email.subject,
                html: email.html,
                attachments: attachements,
            })
                .catch((err) => logger_1.default.error("Can not send email: " + err));
        }
        logger_1.default.info("Email send successfully: " +
            JSON.stringify({
                email: email["to"],
                subject: email["subject"],
            }));
    }
}
exports.default = EmailService;
