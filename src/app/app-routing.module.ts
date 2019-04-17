import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './auth.guard';

const routes: Routes = [
  { path: '', loadChildren: './banner/banner.module#BannerPageModule' },
  { path: 'login', loadChildren: './login/login.module#LoginPageModule' },  
  { path: 'banner', loadChildren: './banner/banner.module#BannerPageModule' },
  { path: 'first-load', loadChildren: './first-load/first-load.module#FirstLoadPageModule' },
  { path: 'tabs', loadChildren: './tabs/tabs.module#TabsPageModule', canActivate : [AuthGuard] },
  { path: 'transfer', loadChildren: './transfer/transfer.module#TransferPageModule', canActivate : [AuthGuard] }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
