import { Component } from '@angular/core';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';

@Component({
  selector: 'app-settings-tab',
  templateUrl: 'settings-tab.page.html',
  styleUrls: ['settings-tab.page.scss']
})
export class SettingsTabPage {

  constructor(public iab: InAppBrowser) {}

  visitFAQ() {
    this.iab.create("https://casinocoin.org/faq", "_system");
  }

}
