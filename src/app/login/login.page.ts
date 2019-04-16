import { Component, OnInit } from '@angular/core';
import { APICallsService } from '../apicalls.service';
import { Storage } from '@ionic/storage';
import { Router } from '@angular/router';
import { CookieService } from 'angular2-cookie/core';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  loginBlockButtonFlag:boolean = false;
  signUpBlockButtonFlag:boolean = true;
  logInFlag:boolean = true;
  signUpFlag:boolean = false;
  forgotPasswordFlag:boolean = false;
  backTologinFlag:boolean = false;
  verificationCodeFlag:boolean = false;
  resetPasswordFlag:boolean = false;

  loginProgress : boolean = false;
  signUpProgress : boolean = false;

  loginUsername:string;
  password:string;
  verificationCode:string;

  signupUsername:string;
  firstName:string;
  lastName:string;
  organization:string;

  forgotUsername:string;

  newPassword:string;
  confirmPassword:string;


  constructor(private apiService:APICallsService, private storage : Storage, private router:Router,
              private cookieService: CookieService, private toastController : ToastController) { }

  ngOnInit() {
  }

  logInBlock() {
    this.logInFlag = true;
    this.signUpFlag = false;
    this.loginBlockButtonFlag = false;
    this.signUpBlockButtonFlag = true;
  }

  signUpBlock() {
    this.logInFlag = false;
    this.signUpFlag = true;
    this.loginBlockButtonFlag = true;
    this.signUpBlockButtonFlag = false;
    this.backTologinFlag = true;
  }

  public loginAPI(){
    console.log("Logging in user - " + this.loginUsername);
    this.loginProgress = true;
    this.apiService.login(this.loginUsername,this.password).subscribe(
      resp => {
        this.cookieService.put('email',resp.email);
        this.cookieService.put('hash', resp.hash);
        this.storage.set('email',resp.email)
          .then(()=>{
            this.storage.set('hash',resp.hash)
              .then(() => {
                this.storage.set('loggedIn',true)
                  .then(() => {
                    this.apiService.isAdmin(this.loginUsername,resp.hash).subscribe(
                      resp=>{
                        console.log('isAdmin - ' + resp);
                        this.storage.set('isAdmin',resp).then(()=>{
                          this.router.navigate(['/tabs']);
                          this.setAllNull();
                        });
                      },err=>{
                        console.log("Is Admin Fail");
                        this.router.navigate(['/tabs']);
                      }
                    );
                  });
              });
          }
        );
        this.loginProgress = false;
      },
      err => {
        console.log("Error occurred while logging in user " + this.loginUsername);
        this.raiseToast("Login Failed!");
        this.loginUsername="";
        this.password="";    
        this.loginProgress = false;
      });
      
  }

  public signupApi(){
    this.signUpProgress = true;
    console.log("In SignupAPI");
    this.apiService.registerUser(this.signupUsername,this.firstName,this.lastName,this.organization).subscribe(
      resp=>{
      console.log("Success");
      this.signUpFlag=false;
      this.loginBlockButtonFlag = false;
      this.verificationCodeFlag = true;
      this.forgotUsername = this.signupUsername;
      this.signUpProgress = false;
    },
    err=>
    {
      this.signUpProgress = false;
      console.log("Error occurred during signup for " + this.signupUsername);
      this.raiseToast("Signup failed");
    })
  }

  //forgot password label
  public forgotPasswordLable(){ 
    console.log("In forgotPasswordLable");
    this.forgotPasswordFlag=true;
    this.logInFlag=false;
    this.signUpBlockButtonFlag = false;
    this.forgotPasswordFlag = true;
    this.backTologinFlag = true;
  }

  public forgotPasswordApi(event){
    console.log("In ForgotPassword");
    this.loginUsername="";
    this.password="";
    this.apiService.resetPasswordSendCode(this.forgotUsername).subscribe(
      resp => {
        // this.username = username;
        this.verificationCodeFlag=true;
        this.forgotPasswordFlag=false;
        console.log("Success");
      },
      err => {
        console.log("Fail");
        this.raiseToast("Invalid Credentials!");
        this.forgotUsername="";
      });
  }

  public enterCodeApi(event){
    console.log("In enterCodeApi");
    this.apiService.resetPasswordVerifyCode(this.forgotUsername,this.verificationCode).subscribe(
      resp=> {
        console.log("Success");
        this.verificationCodeFlag=false;
        this.resetPasswordFlag = true;
        // this.code =code;
      },
      err=>{
        console.log("Fail");
      }
    );
  }
  
  public resetPasswordApi(event){
    console.log("In resetPasswordApi");
    this.apiService.resetPassword(this.forgotUsername,this.verificationCode,this.newPassword,this.confirmPassword).subscribe(
      resp=>{
        console.log("Success");
        this.resetPasswordFlag = false;
        this.backTologinFlag = false;
        this.logInFlag = true;
        this.signUpBlockButtonFlag=true;
        this.setAllNull();
      },
      err=>{
        console.log("Fail");
        this.newPassword="";
        this.confirmPassword="";
      }
    );
  }

  public backTologin(){
    this.setAllNull();
    this.logInFlag = true;
    this.signUpBlockButtonFlag = true;
    this.backTologinFlag = false;
    this.forgotPasswordFlag = false;
    this.verificationCodeFlag = false;
  }

  public setAllNull(){
    this.loginUsername="";
    this.password="";
    this.verificationCode="";
    this.signupUsername="";
    this.firstName="";
    this.lastName="";
    this.organization="";
    this.forgotUsername="";
    this.newPassword="";
    this.confirmPassword="";
  }

  public raiseToast(message:string){
    this.presentToast(message);
  }
  
  async presentToast(message:string) {
    const toast = await this.toastController.create({
      message: message,
      position: 'bottom',
      duration: 2000
    });
    toast.present();
  }

}
