import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { initClientErrorLogger } from './app/services/client-error-logger';

initClientErrorLogger();

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
