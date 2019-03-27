import { Component, OnInit } from '@angular/core';
import { APICallsService } from '../apicalls.service';
import { Storage } from '@ionic/storage';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  constructor(private apiService:APICallsService, private storage : Storage, private router:Router) { }

  ngOnInit() {
  }
  logIn() {
    var x = document.getElementById("logInBlock");
    var y = document.getElementById("signUpBlock");
    y.style.display = "none";
    if (x.style.display === "none") {
      x.style.display = "block";
    } else {
      x.style.display = "none";
    }
  }
  signUp() {
    var x = document.getElementById("signUpBlock");
    var y = document.getElementById("logInBlock");
    y.style.display = "none";
    if (x.style.display === "none") {
      x.style.display = "block";
    } else {
      x.style.display = "none";
    }
  }
  public loginAPI(){
    console.log("In LoginAPI")
    this.apiService.login("vanditsa@buffalo.edu","asdasd").subscribe(
    resp => {
      console.log("Success", resp);
      //this.storage.set('email',resp.email);
      //this.storage.set('hash',resp.hash);
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

}
