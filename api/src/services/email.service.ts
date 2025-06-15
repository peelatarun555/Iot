import { Locale } from "@utils/enums";
import { env, isDevEnv, isProductionEnv } from "@utils/env";
import Logger from "@tightec/logger";
import { createTransport } from "nodemailer";
import LocalizationService from "./localization.service";

export default class EmailService {
  private locale: Locale;

  constructor(locale: Locale = Locale.de) {
    this.locale = locale;
  }

  public async sendCreateNewUserEmail(options: {
    email: string;
    name: string;
    passwordTmp: string;
  }): Promise<void> {
    const localizationService = new LocalizationService(this.locale);

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

  public async sendPasswordResetEmail(options: {
    email: string;
    name: string;
    passwordTmp: string;
  }): Promise<void> {
    const localizationService = new LocalizationService(this.locale);

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

  /**
   * Send email to email
   * @param email
   * @param filename
   */
  private async sendEmail(
    email: {
      to: string;
      subject: string;
      html: string;
    },
    attachements?: { filename: string; content: string }[]
  ): Promise<void> {
    if (isProductionEnv() || isDevEnv()) {
      const transporter = createTransport({
        host: env.EMAIL_SERVER_SMTP,
        port: env.EMAIL_PORT_SMTP,
        secure: isProductionEnv(),
        auth: {
          user: env.EMAIL_ADDRESS_SMTP,
          pass: env.EMAIL_PASSWORD_SMTP,
        },
      });

      await transporter
        .sendMail({
          from: {
            name: "eotlab",
            address: env.EMAIL_ADDRESS_SMTP,
          },
          to: email.to,
          subject: email.subject,
          html: email.html,
          attachments: attachements,
        })
        .catch((err) => Logger.error("Can not send email: " + err));
    }

    Logger.info(
      "Email send successfully: " +
        JSON.stringify({
          email: email["to"],
          subject: email["subject"],
        })
    );
  }
}
