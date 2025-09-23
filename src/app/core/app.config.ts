import { ApplicationConfig, importProvidersFrom, APP_INITIALIZER } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi, HTTP_INTERCEPTORS } from '@angular/common/http';
import { routes } from './app.routes';
import { ToastrModule } from 'ngx-toastr';
import { AuthInterceptor } from './auth/auth.interceptor';
import { provideNgxMask } from 'ngx-mask';
import { provideAnimations } from '@angular/platform-browser/animations';
import { FontAwesomeModule, FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { registerIcons } from '../../shareds/icons/fontawesome.icon';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptorsFromDi()),

    importProvidersFrom(
      ToastrModule.forRoot(),
      FontAwesomeModule
    ),

    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },

    provideNgxMask({
      dropSpecialCharacters: false,
    }),

    provideAnimations(),

    {
      provide: APP_INITIALIZER,
      multi: true,
      deps: [FaIconLibrary],
      useFactory: (library: FaIconLibrary) => () => registerIcons(library),
    },
  ]
};