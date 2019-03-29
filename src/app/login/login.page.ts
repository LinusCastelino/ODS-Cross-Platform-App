import { Component, OnInit } from '@angular/core';
import { APICallsService } from '../apicalls.service';
import { Storage } from '@ionic/storage';
import { Router } from '@angular/router';
import { CookieService } from 'angular2-cookie/core';

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
  emailErrorFP:boolean=false;
  verificationCodeFlag:boolean = false;
  resetPasswordFlag:boolean = false;

  username:string;
  code:string;

  constructor(private apiService:APICallsService, private storage : Storage, private router:Router,
              private cookieService: CookieService) { }

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
  }
  public loginAPI(event){
    console.log("In LoginAPI");
    event.preventDefault();
    var target = event.target;
    var username  = target.querySelector('#loginEmail').value;
    var password  = target.querySelector('#loginPassword').value;
    this.apiService.login(username,password).subscribe(
    resp => {
      // console.log("Success", resp);
      this.cookieService.put('email',resp.email);
      this.cookieService.put('hash', resp.hash);
      this.storage.set('email',resp.email);
      this.storage.set('hash',resp.hash);
      this.storage.set('loggedIn',true);
      
      
      this.apiService.isAdmin(username,resp.hash).subscribe(
        resp=>{
          console.log(resp);
          this.storage.set('isAdmin',resp);
          
          // this.tabsService.updateFlag(resp);
        },err=>{
          console.log("Is Admin Fail");
        }
      );
      this.router.navigate(['/tabs']);
      // console.log("Cookie values - " + this.cookieService.get('email') + " " + this.cookieService.get('hash'));
    },
    err => {
      console.log("Fail");
    });

    
  }
  public signupApi(event){
    console.log("In SignupAPI");
    event.preventDefault();
    var target = event.target;
    var username  = target.querySelector('#signupEmail').value;
    var firstName  = target.querySelector('#firstName').value;
    var lastName  = target.querySelector('#lastName').value;
    var organization = target.querySelector('#organization').value;
    this.apiService.registerUser(username,firstName,lastName,organization).subscribe(
      resp=>{
      console.log("Success");
      this.signUpFlag=false;
      this.loginBlockButtonFlag = false;
      this.verificationCodeFlag = true;
      this.username=username;
    },
    err=>
    {
      console.log("Fail");
    })


  }
  //forgot password label
  public forgotPasswordLable(){ 
    console.log("In forgotPasswordLable");
    this.forgotPasswordFlag=true;
    this.logInFlag=false;
    this.signUpBlockButtonFlag = false;
  }

  public forgotPasswordApi(event){
    console.log("In ForgotPassword");
    event.preventDefault();
    var target = event.target;
    var username  = target.querySelector('#forgotPasswordEmail').value;
    this.apiService.resetPasswordSendCode(username).subscribe(
      resp => {
        this.username = username;
        this.verificationCodeFlag=true;
        this.forgotPasswordFlag=false;
        this.emailErrorFP = false;
        console.log("Success");
      },
      err => {
        console.log("Fail");
        this.emailErrorFP = true;
      });

  }
  public enterCodeApi(event){
    console.log("In enterCodeApi");
    event.preventDefault();
    var target = event.target;
    var code  = target.querySelector('#verificationCode').value;
    this.apiService.resetPasswordVerifyCode(this.username,code).subscribe(
      resp=> {
        console.log("Success");
        this.verificationCodeFlag=false;
        this.resetPasswordFlag = true;
        this.code =code;
      },
      err=>{
        console.log("Fail");
      }
    );

  }
  public resetPasswordApi(event){
    console.log("In resetPasswordApi");
    event.preventDefault();
    var target = event.target;
    var password  = target.querySelector('#newPassword').value;
    var cpassword  = target.querySelector('#confirmPassword').value;
    this.apiService.resetPassword(this.username,this.code,password,cpassword).subscribe(
      resp=>{
        console.log("Success");
        this.resetPasswordFlag = false;
        this.logInFlag = true;
      },
      err=>{
        console.log("Fail");
      }
    );


  }

}
