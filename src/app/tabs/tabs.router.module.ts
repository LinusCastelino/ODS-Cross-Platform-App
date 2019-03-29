import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'transfer',
        children: [
          {
            path: '',
            loadChildren: '../transfer/transfer.module#TransferPageModule'
          }
        ]
      },
      {
        path: 'queue',
        children: [
          {
            path: '',
            loadChildren: '../queue/queue.module#QueuePageModule'
          }
        ]
      },
      {
        path: 'profile',
        children: [
          {
            path: '',
            loadChildren: '../profile/profile.module#ProfilePageModule'
          }
        ]
      },
      {
        path: 'admin',
        children: [
          {
            path: '',
            loadChildren: '../admin/admin.module#AdminPageModule'
          }
        ]
      },
      {
        path: '',
        redirectTo: 'transfer',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    redirectTo: 'tabs/transfer',
    pathMatch: 'full'
  },
  {
    path: 'transfer',
    redirectTo: 'tabs/transfer',
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
