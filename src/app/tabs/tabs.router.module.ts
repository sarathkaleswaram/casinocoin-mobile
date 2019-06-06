import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: '',
    component: TabsPage,
    children: [
      {
        path: 'accounts-tab',
        children: [
          {
            path: '',
            loadChildren: '../pages/accounts-tab/accounts-tab.module#AccountsTabPageModule'
          }
        ]
      },
      {
        path: 'send-tab',
        children: [
          {
            path: '',
            loadChildren: '../pages/send-tab/send-tab.module#SendTabPageModule'
          }
        ]
      },
      {
        path: 'settings-tab',
        children: [
          {
            path: '',
            loadChildren: '../pages/settings-tab/settings-tab.module#Tab3PageModule'
          }
        ]
      },
      {
        path: '',
        redirectTo: '/tabs/accounts-tab',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    redirectTo: '/tabs/accounts-tab',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [RouterModule]
})
export class TabsPageRoutingModule {}
