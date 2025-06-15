import { Locale } from "@utils/enums";

const translations: { [key: string]: { [key: string]: string } } = {
  de: {
    createUserSubject: "Eotlab Datenplatform: Konto erstellt",
    createUserBody:
      "<p>Hallo {{name}},</p><p>es wurde soeben ein Zugang zu der Eotlab-Datenplattform für Sie erstellt. Sie können sich mit den folgenden Zugangsdaten anmelden:</p>Email: {{email}} <br />Passwort: {{password}}<p>Die Datenplatform finden Sie hier:<a href='https://api.data.eotlab.de'> https://api.data.eotlab.de</a></p>",
    resetPasswordSubject: "Eotlab Datenplatform: Passwort zurücksetzen",
    resetPasswordBody:
      "<p>Hallo {{name}},</p><p>Sie haben ein neues Passwort angefragt. Sie können sich mit dem folgenden Passwort in der App anmelden:</p>Passwort: {{password}}<p>Die Datenplatform finden Sie hier:<a href='https://api.data.eotlab.de'> https://api.data.eotlab.de</a></p>",
  },
  en: {
    createUserSubject: "Eotlab data platform: account created",
    createUserBody:
      "<p>Hello {{name}},</p><p>An access to the Eotlab data platform has just been created for you. You can log in with the following credentials:</p><p>Email: {{email}}<br />Password: {{password}}</p><p>You can find the data platform here: <a href='https://api.data.eotlab.de'>https://api.data.eotlab.de</a></p>",
    resetPasswordSubject: "Eotlab Data Platform: Reset Password",
    resetPasswordBody:
      "<p>Hello {{name}},</p><p>You have requested a new password. You can log in to the app with the following password:</p><p>Password: {{password}}</p><p>You can find the data platform here: <a href='https://api.data.eotlab.de'>https://api.data.eotlab.de</a></p>",
  },
};

class LocalizationService {
  private translations: { [key: string]: { [key: string]: string } };
  public locale: Locale;

  constructor(locale: Locale) {
    this.translations = translations;
    this.locale = locale;
  }

  /**
   * Translate a string with params
   * @param translate
   * @param params
   * @returns translated string
   */
  public translate(
    translate: string,
    params?: { [n: string]: string }
  ): string {
    let body: string = this.translations[this.locale.toString()][translate];

    if (!body)
      throw new Error(
        "Translation not found in: " + this.locale + " - " + translate
      );

    for (const key in params) {
      body = body.split("{{" + key + "}}").join(params[key]);
    }

    return body;
  }

  /**
   * Format datetime language specific
   * @param dateTime
   * @returns formated date
   */
  public formatDateTime(dateTime: Date): string {
    if (this.locale == Locale.de) {
      return dateTime.toLocaleString("de-DE", { timeZone: process.env.TZ });
    }

    return dateTime.toLocaleString("en-GB", { timeZone: process.env.TZ });
  }
}

export default LocalizationService;
