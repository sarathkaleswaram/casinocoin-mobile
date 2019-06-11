import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { LocalStorageService } from 'ngx-store';
import { AppConstants } from 'src/app/domain/app-constants';

@Component({
  selector: 'app-create-wallet',
  templateUrl: './create-wallet.page.html',
  styleUrls: ['./create-wallet.page.scss'],
})
export class CreateWalletPage implements OnInit {

  title: string = "Set New PIN";
  enteredPinCode: string = "";
  pinSubmitted: boolean = false;
  pinVerified: boolean = false;

  constructor(
    private localStorageService: LocalStorageService,
    private navCtrl: NavController) { }

  ngOnInit() {
  }

  handlePinInput(pin: string) {
    this.enteredPinCode += pin;
    if (this.enteredPinCode.length === 6) {
      this.validatePincode();
    }
  }

  validatePincode() {
    if (this.pinSubmitted) {
      if (this.enteredPinCode.length === 6) {
        this.pinVerified = true;
        this.title = "Set Passphrase";
      }
    } else {
      if (this.enteredPinCode.length === 6) {
        this.enteredPinCode = "";
        this.title = "Repeat New PIN";
        this.pinSubmitted = true;
      }
    }
  }

  backspacePin() {
    this.enteredPinCode = this.enteredPinCode.substring(0, this.enteredPinCode.length - 1);
  }

  closePin() {
    this.enteredPinCode = "";
  }

  validatePassPhrase() {
    this.localStorageService.set(AppConstants.KEY_SETUP_COMPLETED, true);
    this.navCtrl.navigateRoot('/recovery');
  }

}
