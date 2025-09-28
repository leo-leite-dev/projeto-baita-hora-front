import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/core/app.component';
import { appConfig } from './app/core/app.config';
import { provideAnimations } from '@angular/platform-browser/animations';
import { importProvidersFrom, LOCALE_ID } from '@angular/core';
import { ToastrModule } from 'ngx-toastr';
import { registerLocaleData } from '@angular/common';
import ptBr from '@angular/common/locales/pt';
registerLocaleData(ptBr);

bootstrapApplication(AppComponent, {
  ...appConfig,
  providers: [
    ...(appConfig.providers ?? []),
    provideAnimations(),
    importProvidersFrom(
      ToastrModule.forRoot({
        positionClass: 'toast-bottom-right',
        timeOut: 3500,
        progressBar: true,
        closeButton: true,
        newestOnTop: true,
        preventDuplicates: true,
        toastClass: 'ngx-toastr custom-toast',
      })
    ),
    { provide: LOCALE_ID, useValue: 'pt-BR' },
  ],
}).catch(err => console.error(err));
