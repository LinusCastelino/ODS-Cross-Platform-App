import { Component, OnInit } from '@angular/core';
import { APICallsService } from '../apicalls.service';
import { Storage } from '@ionic/storage';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { Platform } from '@ionic/angular';

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

  changePasswordButton:string;
  subscription : any;

  constructor(private apiService:APICallsService, private storage : Storage, private router:Router,
              private toastController : ToastController, private platform : Platform) {
    
    // route user to tabs page if back button is clicked on any of the transfer pages
    this.storage.get('loggedIn').then(loggedIn=>{
      if(loggedIn){
        this.router.navigate(['/tabs'], {skipLocationChange : true});
      }
    });    
  }

  ionViewDidEnter(){
    this.subscription = this.platform.backButton.subscribe(()=>{
      navigator['app'].exitApp();
    });
  }

  ionViewWillLeave(){
    this.subscription.unsubscribe();
  }

  ngOnInit() {
    this.setAllNull();
  }

  logInBlock() {
    this.logInFlag = true;
    this.signUpFlag = false;
    this.loginBlockButtonFlag = false;
    this.signUpBlockButtonFlag = true;
    this.setAllNull();
  }

  signUpBlock() {
    this.logInFlag = false;
    this.signUpFlag = true;
    this.loginBlockButtonFlag = true;
    this.signUpBlockButtonFlag = false;
    this.backTologinFlag = true;
    this.setAllNull();
  }

  public loginAPI(){
    console.log("In LoginAPI");
    if(this.loginUsername==null || this.password==null || this.loginUsername=="" || this.password==""){
      this.raiseToast("Password or Email ID field is empty.");
    }else{
      this.apiService.login(this.loginUsername,this.password).subscribe(
        resp => {
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
                            this.router.navigate(['/tabs'], { skipLocationChange: true });
                            this.setAllNull();
                          });
                        },err=>{
                          console.log("Is Admin Fail");
                          this.router.navigate(['/tabs'], { skipLocationChange: true });
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
          this.raiseToast("Invalid login credentials.");
          this.loginUsername=null;
          this.password=null;  
          this.loginProgress = false;  
        });
    }
      
  }

  public signupApi(){
    this.signUpProgress = true;
    console.log("In SignupAPI");
    if(this.signupUsername==null || this.firstName==null || this.lastName==null || this.organization==null || 
      this.signupUsername=="" || this.firstName=="" || this.lastName=="" || this.organization==""){
        this.raiseToast("Input all mandatory fields.");
        this.signUpProgress = false;
    }else{
      this.apiService.registerUser(this.signupUsername,this.firstName,this.lastName,this.organization).subscribe(
        resp=>{
        this.signUpFlag=false;
        this.loginBlockButtonFlag = false;
        this.verificationCodeFlag = true;
        this.forgotUsername = this.signupUsername;
        this.changePasswordButton="Set Password";
        this.signUpProgress = false;
      },
      err=>
      {
        this.signUpProgress = false;
        console.log("Error occurred during signup for " + this.signupUsername);
        this.raiseToast("Signup failed, please try again.");
      });
    }
  }

  //forgot password label
  public forgotPasswordLable(){ 
    console.log("In forgotPasswordLable");
    this.forgotPasswordFlag=true;
    this.logInFlag=false;
    this.signUpBlockButtonFlag = false;
    this.forgotPasswordFlag = true;
    this.backTologinFlag = true;
    this.setAllNull();
  }

  public forgotPasswordApi(){
    console.log("In ForgotPassword");
    if(this.forgotUsername==null || this.forgotUsername==""){
      this.raiseToast("Email ID field is empty.");
    }else{
      this.apiService.resetPasswordSendCode(this.forgotUsername).subscribe(
        resp => {
          this.verificationCodeFlag=true;
          this.forgotPasswordFlag=false;
          this.changePasswordButton="Reset Password";
        },
        err => {
          this.raiseToast("Invalid Credentials!");
          this.forgotUsername=null;
        });
    }

  }
  public enterCodeApi(){
    console.log("In enterCodeApi");
    if(this.verificationCode==null || this.verificationCode==""){
      this.raiseToast("Verification code field is empty.");
    }else{
      this.apiService.resetPasswordVerifyCode(this.forgotUsername,this.verificationCode).subscribe(
        resp=> {
          this.verificationCodeFlag=false;
          this.resetPasswordFlag = true;
        },
        err=>{
          this.raiseToast("Invalid verification code entered.");
          this.verificationCode=null;
        }
      );
    }

  }
  public resetPasswordApi(){
    console.log("In resetPasswordApi");
    if(this.confirmPassword==null || this.newPassword==null || this.confirmPassword=="" || this.newPassword==""){
      this.raiseToast("Confirm Password or New Password field is empty.");
    }else{
      this.apiService.resetPassword(this.forgotUsername,this.verificationCode,this.newPassword,this.confirmPassword).subscribe(
        resp=>{
          this.resetPasswordFlag = false;
          this.backTologinFlag = false;
          this.logInFlag = true;
          this.signUpBlockButtonFlag=true;
          this.setAllNull();
        },
        err=>{
          this.newPassword=null;
          this.confirmPassword=null;
          this.raiseToast("Confirm Password and New Password does not match.");
        }
      );
    }
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
    this.loginUsername=null;
    this.password=null;
    this.verificationCode=null;
    this.signupUsername=null;
    this.firstName=null;
    this.lastName=null;
    this.organization=null;
    this.forgotUsername=null;
    this.newPassword=null;
    this.confirmPassword=null;
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
