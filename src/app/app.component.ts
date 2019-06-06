import { Component } from '@angular/core';

import { Platform, NavController } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { LocalStorageService } from 'ngx-store';
import { AppConstants } from './domain/app-constants';
import { LogService } from './providers/log.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html'
})
export class AppComponent {
  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private localStorageService: LocalStorageService,
    private navCtrl: NavController,
    private logger: LogService
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();

      if (this.localStorageService.get(AppConstants.KEY_SETUP_COMPLETED)) {
        this.logger.debug('### Redirecting to Login ###');
        this.navCtrl.navigateRoot('/login');
      } else {
        this.logger.debug('### Redirecting to Setup ###');
        this.navCtrl.navigateRoot('/setup');
      }
    });
  }
}
