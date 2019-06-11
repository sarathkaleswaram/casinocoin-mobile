import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-recovery',
  templateUrl: './recovery.page.html',
  styleUrls: ['./recovery.page.scss'],
})
export class RecoveryPage implements OnInit {

  constructor(private navCtrl: NavController) { }

  ngOnInit() {
  }
  goTOMain() {
    this.navCtrl.navigateRoot('/tabs');
  }
}
