import { Component, OnInit } from '@angular/core';
import { APICallsService } from '../apicalls.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  constructor(private apiService:APICallsService) { }

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
    },
    err => {
      console.log("Fail");
    });
    
  }

}
