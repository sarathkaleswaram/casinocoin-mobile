import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { AddExistingAddressPage } from './add-existing-address.page';

const routes: Routes = [
  {
    path: '',
    component: AddExistingAddressPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [AddExistingAddressPage]
})
export class AddExistingAddressPageModule {}
