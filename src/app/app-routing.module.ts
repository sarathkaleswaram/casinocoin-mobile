import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'tabs', loadChildren: './tabs/tabs.module#TabsPageModule' },
  { path: 'login', loadChildren: './pages/login/login.module#LoginPageModule' },
  { path: 'add-account', loadChildren: './pages/add-account/add-account.module#AddAccountPageModule' },
  { path: 'setup', loadChildren: './pages/setup/setup.module#SetupPageModule' },
  { path: 'create-wallet', loadChildren: './pages/create-wallet/create-wallet.module#CreateWalletPageModule' },
  { path: 'restore-wallet', loadChildren: './pages/restore-wallet/restore-wallet.module#RestoreWalletPageModule' },
  { path: 'generate-new-address', loadChildren: './pages/generate-new-address/generate-new-address.module#GenerateNewAddressPageModule' },
  { path: 'add-existing-address', loadChildren: './pages/add-existing-address/add-existing-address.module#AddExistingAddressPageModule' },
  { path: 'change-pin', loadChildren: './pages/change-pin/change-pin.module#ChangePinPageModule' },
  { path: 'change-passphrase', loadChildren: './pages/change-passphrase/change-passphrase.module#ChangePassphrasePageModule' },
  { path: 'backup-wallet', loadChildren: './pages/backup-wallet/backup-wallet.module#BackupWalletPageModule' },
  { path: 'restore-existing-wallet', loadChildren: './pages/restore-existing-wallet/restore-existing-wallet.module#RestoreExistingWalletPageModule' },
  { path: 'recovery', loadChildren: './pages/recovery/recovery.module#RecoveryPageModule' }

];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
