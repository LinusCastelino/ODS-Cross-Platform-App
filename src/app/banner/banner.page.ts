import { Component, OnInit } from '@angular/core';
import { Storage } from '@ionic/storage';
import { Router } from "@angular/router";
import { splashTimeout } from '../constants';

@Component({
  selector: 'app-banner',
  templateUrl: './banner.page.html',
  styleUrls: ['./banner.page.scss'],
})
export class BannerPage implements OnInit {

  navigateToNextPage;

  constructor(private storage : Storage, private router : Router) { 

    this.navigateToNextPage = () =>{
      this.storage.get('firstLoad').then(firstLoad => {
        if(firstLoad === null){
          this.storage.set('firstLoad', true);
          this.router.navigate(['/first-load']);
        }
        else{
          if(firstLoad === true){
            // not the first time this app has been loaded
            // user has already seen the carousel
            this.storage.get('loggedIn').then(loggedIn =>{
              if(loggedIn === true){
                // user log in credentials are stored in the local storage
                // redirect user to transfer page
                this.router.navigate(['/tabs']);
              }
              else{
                // no log in info
                // redirect user to log in page
                this.router.navigate(['/login']);
              }
            });
          }
        }
      });
    }

  }

  ngOnInit() {
    setTimeout(this.navigateToNextPage, splashTimeout);
  }

}
