import { Component } from '@angular/core';
import { LogService } from 'src/app/providers/log.service';
import { Router } from '@angular/router';
import { LoginPage } from '../login/login.page';
import { LoginPageModule } from '../login/login.module';

@Component({
  selector: 'app-accounts-tab',
  templateUrl: 'accounts-tab.page.html',
  styleUrls: ['accounts-tab.page.scss']
})
export class AccountsTabPage {

  constructor(private logger: LogService, private router: Router) {
    this.logger.debug("### Login Successful ###")
  }

}
