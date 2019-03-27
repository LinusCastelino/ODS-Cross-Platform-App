import { Component, OnInit } from '@angular/core';
import { Storage } from '@ionic/storage';
@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {

  constructor(private storage : Storage) { }
  email:any;
  profile:boolean=false;
  
  ngOnInit() {
    var self = this;
    this.getEmail('email').then(function(value){
  self.email = value;
  
   console.log(self.email);
   self.profile = true;
  });
  }
getEmail(data):any{
  return this.storage.get(data).then(function(value) {
    return value;
  });
  }
}
