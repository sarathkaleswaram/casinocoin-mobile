import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { GenerateNewAddressPage } from './generate-new-address.page';

const routes: Routes = [
  {
    path: '',
    component: GenerateNewAddressPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [GenerateNewAddressPage]
})
export class GenerateNewAddressPageModule {}
