import { platformBrowser } from '@angular/platform-browser';
import { AppModule } from './app/app.module';

(window as any).MonacoEnvironment = {
  getWorkerUrl: function (_: string, label: string) {
    return '/assets/monaco/base/worker/workerMain.js';
  }
};

platformBrowser().bootstrapModule(AppModule)
  .catch((err) => console.error(err));