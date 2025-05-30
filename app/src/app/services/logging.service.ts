// logging.service.ts

import { Injectable } from '@angular/core';
import { NGXLogger } from 'ngx-logger';

@Injectable({
    providedIn: 'root',
})
export class LoggingService {
    constructor(private logger: NGXLogger) {}

    log(message: string) {
        this.logger.log(message);
    }

    debug(message: string) {
        this.logger.debug(message);
    }

    info(message: string) {
        this.logger.info(message);
    }

    warn(message: string) {
        this.logger.warn(message);
    }

    error(message: string) {
        this.logger.error(message);
    }

    fatal(message: string) {
        this.logger.fatal(message);
    }
    // You can add other logging methods here (e.g., error, warn, info, debug)
}
