import { Component } from '@angular/core';
import { LogService } from 'src/app/providers/log.service';

@Component({
  selector: 'app-accounts-tab',
  templateUrl: 'accounts-tab.page.html',
  styleUrls: ['accounts-tab.page.scss']
})
export class AccountsTabPage {

  constructor(private logger: LogService) {
    this.logger.debug("### Login Successful ###")
  }

}
