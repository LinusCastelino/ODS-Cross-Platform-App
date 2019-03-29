import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { CookieService } from 'angular2-cookie/services/cookies.service';

import { IonicModule } from '@ionic/angular';

import { LoginPage } from './login.page';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';

const routes: Routes = [
  {
    path: '',
    component: LoginPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  providers: [CookieService],
  declarations: [LoginPage, ForgotPasswordComponent]
})
export class LoginPageModule {}
