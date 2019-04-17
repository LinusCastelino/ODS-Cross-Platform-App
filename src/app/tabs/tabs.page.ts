import { Component, OnInit } from '@angular/core';
import { Storage } from '@ionic/storage';
import { Platform } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})

export class TabsPage { 

  isAdmin : boolean = false;
  subscription : any;

  constructor(private storage : Storage, private platform : Platform, private router : Router){
    this.storage.get('isAdmin')
      .then(value =>{
        if(value)
          this.isAdmin = value;
      })
      .catch(err =>{
        console.error('Error occurred while fetching isAdmin value from storage');
        console.error(err);
      })
  }

  ionViewDidEnter(){
    this.subscription = this.platform.backButton.subscribe(()=>{
      this.router.navigate(['/tabs'], {skipLocationChange : true});
    });
  }

  ionViewWillLeave(){
    this.subscription.unsubscribe();
  }
}

