import { LoginComponent } from './login.component';
import { LoggerModule, NgxLoggerLevel } from 'ngx-logger';
import { TranslateModule } from '@ngx-translate/core';
import { ApolloModule } from 'apollo-angular';

describe('LoginComponent', () => {
    it('can mount', () => {
        cy.mount(LoginComponent, {
            imports: [
                LoggerModule.forRoot({ level: NgxLoggerLevel.DEBUG }),
                TranslateModule.forRoot({}),
                ApolloModule,
            ],
        });
    });
});
