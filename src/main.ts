import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/core/app.component';
import { appConfig } from './app/core/app.config';
import { provideAnimations } from '@angular/platform-browser/animations';
import { importProvidersFrom } from '@angular/core';
import { ToastrModule } from 'ngx-toastr';

bootstrapApplication(AppComponent, {
  ...appConfig,
  providers: [
    ...(appConfig.providers ?? []),
    provideAnimations(),
    importProvidersFrom(
      ToastrModule.forRoot({
        positionClass: 'toast-bottom-right',
        timeOut: 5000,
        closeButton: true,
        progressBar: true,
      })
    ),
  ],
}).catch(err => console.error(err));