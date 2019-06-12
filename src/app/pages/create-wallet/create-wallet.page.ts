import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { LocalStorageService } from 'ngx-store';
import { AppConstants } from 'src/app/domain/app-constants';
import { AlertController } from '@ionic/angular';
import { CSCCrypto } from 'src/app/domain/csc-crypto';

@Component({
  selector: 'app-create-wallet',
  templateUrl: './create-wallet.page.html',
  styleUrls: ['./create-wallet.page.scss'],
})
export class CreateWalletPage implements OnInit {

  title: string = "Set New PIN";
  enteredPinCode: string = "";
  submittedPinCode: string = "";
  pinSubmitted: boolean = false;
  pinVerified: boolean = false;
  walletPassphrase: string = "";
  walletPassphraseConfirmed: string = "";
  recoveryShow: boolean = false;
  recoveryToggleOne: boolean = false;
  recoveryToggleTwo: boolean = false;

  constructor(
    private localStorageService: LocalStorageService,
    private navCtrl: NavController,
    private alertCtrl: AlertController) { }

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
        if (this.submittedPinCode === this.enteredPinCode) {
          this.pinVerified = true;
        } else {
          this.showAlert("PIN do not match.");
          this.title = "Set New PIN";
          this.enteredPinCode = "";
          this.submittedPinCode = "";
          this.pinVerified = false;
          this.pinSubmitted = false;
        }
      }
    } else {
      if (this.enteredPinCode.length === 6) {
        this.submittedPinCode = this.enteredPinCode;
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
    if (this.walletPassphrase.length == 0 || this.walletPassphraseConfirmed.length == 0) {
      this.showAlert("Passphrase cannot be empty.");
    } else {
      if (this.walletPassphrase === this.walletPassphraseConfirmed) {
        this.recoveryShow = true;
      } else {
        this.showAlert("Passphrase do not match.");
      }
    }
  }

  async showAlert(header: string) {
    let prompt = await this.alertCtrl.create({
      header: header,
      buttons: [
        { text: 'Okay' },
      ]
    });
    await prompt.present();
  }

  finishSetup() {
    if (this.recoveryToggleOne && this.recoveryToggleTwo) {
      this.localStorageService.set(AppConstants.KEY_SETUP_COMPLETED, true);
      this.navCtrl.navigateRoot('/tabs');
    } else {
      this.showAlert("You must confirm that you've written your recovery phrase down and that you understand it's not a backup.");
    }
  }

}
