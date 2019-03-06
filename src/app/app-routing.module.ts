import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', loadChildren: './first-load/first-load.module#FirstLoadPageModule' },
  { path: 'login', loadChildren: './login/login.module#LoginPageModule' },  
  { path: 'banner', loadChildren: './banner/banner.module#BannerPageModule' },
  { path: 'first-load', loadChildren: './first-load/first-load.module#FirstLoadPageModule' },
  { path: 'tabs', loadChildren: './tabs/tabs.module#TabsPageModule' },
  // { path: 'transfer', loadChildren: './transfer/transfer.module#TransferPageModule' },
  // { path: 'queue', loadChildren: './queue/queue.module#QueuePageModule' },
  // { path: 'admin', loadChildren: './admin/admin.module#AdminPageModule' },
  // { path: 'profile', loadChildren: './profile/profile.module#ProfilePageModule' }
];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
