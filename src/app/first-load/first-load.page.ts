import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-first-load',
  templateUrl: './first-load.page.html',
  styleUrls: ['./first-load.page.scss'],
})
export class FirstLoadPage implements OnInit {

  constructor(private router:Router) { 
  }

  ngOnInit() {
      var slides = document.querySelector('ion-slides');
      slides.options = {
      effect: 'flip'
    }
  }

  public logInPage(){
    this.router.navigate(['/login']);
  }

  

}
