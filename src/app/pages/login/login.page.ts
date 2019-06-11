import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { ActivatedRoute, RouterModule } from '@angular/router';
@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  enteredPinCode: string = "";

  constructor(private navCtrl: NavController, private route:ActivatedRoute, public router:RouterModule) { 

  }

  ngOnInit() {
  }

  handlePinInput(pin: string) {
    this.enteredPinCode += pin;
    if (this.enteredPinCode.length === 6) {
      this.validatePincode();
    }
  }

  validatePincode() {
    this.navCtrl.navigateRoot('/tabs');
  }

  backspacePin() {
    this.enteredPinCode = this.enteredPinCode.substring(0, this.enteredPinCode.length - 1);
  }

  closePin() {
    this.enteredPinCode = "";
  }
  goToRecovery(){
    this.navCtrl.navigateRoot('/login');
  }
}
