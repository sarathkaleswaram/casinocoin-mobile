import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { RestoreExistingWalletPage } from './restore-existing-wallet.page';

const routes: Routes = [
  {
    path: '',
    component: RestoreExistingWalletPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [RestoreExistingWalletPage]
})
export class RestoreExistingWalletPageModule {}
