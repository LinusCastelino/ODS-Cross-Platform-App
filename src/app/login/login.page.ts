import { Component, OnInit } from '@angular/core';
import { APICallsService } from '../apicalls.service';
import { Storage } from '@ionic/storage';
import { Router } from '@angular/router';
import { CookieService } from 'angular2-cookie/core'

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  constructor(private apiService:APICallsService, private storage : Storage, private router:Router,
              private cookieService: CookieService) { }

  ngOnInit() {
  }
  logInBlock() {
    var logInBlock = document.getElementById("logInBlock");
    var signUpBlock = document.getElementById("signUpBlock");
    var loginBlockButton = document.getElementById("loginBlockButton");
    var signUpBlockButton = document.getElementById("signUpBlockButton");
    loginBlockButton.style.display = "none";
    signUpBlockButton.style.display = "block"
    logInBlock.style.display = "block";
    signUpBlock.style.display = "none";
  }
  signUpBlock() {
    var signUpBlock = document.getElementById("signUpBlock");
    var logInBlock = document.getElementById("logInBlock");
    var signUpBlockButton = document.getElementById("signUpBlockButton");
    var loginBlockButton = document.getElementById("loginBlockButton");
    loginBlockButton.style.display = "block";
    signUpBlockButton.style.display = "none";
    logInBlock.style.display = "none";
    signUpBlock.style.display = "block";
  }
  public loginAPI(event){
    console.log("In LoginAPI");
    event.preventDefault();
    const target = event.target;
    const username  = target.querySelector('#loginEmail').value;
    const password  = target.querySelector('#loginPassword').value;
    this.apiService.login(username,password).subscribe(
    resp => {
      // console.log("Success", resp);
      this.cookieService.put('email',resp.email);
      this.cookieService.put('hash', resp.hash);
      this.storage.set('email',resp.email);
      this.storage.set('hash',resp.hash);
      this.storage.set('loggedIn',true);
      // console.log(this.storage.get('email'));
      // console.log(this.storage.get('hash'));
      // console.log(this.storage.get('loggedIn'));
      this.router.navigate(['/tabs']);
    },
    err => {
      console.log("Fail");
    });
  }
  public signupApi(event){
    console.log("In SignupAPI");
    event.preventDefault();
    const target = event.target;
    const username  = target.querySelector('#signupEmail').value;
    const password  = target.querySelector('#signupPassword').value;
    const confirmPassword  = target.querySelector('#signupConfirmPassword').value;
    if(confirmPassword == password){
      console.log("MATCHED");
    }
    else{
      console.log("No MATCH");
    }

  }

}
