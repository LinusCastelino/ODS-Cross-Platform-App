import { Component, OnInit } from '@angular/core';
import { Storage } from '@ionic/storage';
import { APICallsService } from '../apicalls.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {

  constructor(private storage : Storage,private apiService:APICallsService,private router:Router) { 
    
  }
  columnOneSize:number = 4;
  columnTwoSize:number = 8;
  email:any;
  hash:any;
  fname:any;
  lname:any;
  organization:any;
  changePasswordFlag:boolean=false;
  profileFlag:boolean=true;
  profileOldPass:string;
  profileNewPass:string;
  profileConfirmNewPass:string;
  ngOnInit() {
    var self = this;
    this.getData('email').then(function(value){
    self.email = value;
    self.apiService.getUser(self.email).subscribe(user=>{
      self.fname=user.firstName;
      self.lname=user.lastName;
      self.organization=user.organization;
      self.hash=user.hash;
    });
  });
  }
getData(data):any{
  return this.storage.get(data).then(function(value) {
    return value;
  });
  }

  public changePassword(){
    console.log(this.profileConfirmNewPass,this.profileOldPass,this.profileNewPass)
    this.apiService.changePassword(this.profileOldPass,this.profileNewPass,this.profileConfirmNewPass,this.email,this.hash).subscribe(
      resp=>{
        this.logOut();
      },err=>{
        console.log("Fail");
      }
    )
  }
  public logOut(){
    this.storage.clear().then(()=>{
      this.router.navigate(['/login']);
    });
  }
  public resetPassword(){
    this.profileFlag=false;
    this.changePasswordFlag=true;

  }
}
