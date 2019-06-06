import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { ChangePassphrasePage } from './change-passphrase.page';

const routes: Routes = [
  {
    path: '',
    component: ChangePassphrasePage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [ChangePassphrasePage]
})
export class ChangePassphrasePageModule {}
