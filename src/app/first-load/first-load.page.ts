import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-first-load',
  templateUrl: './first-load.page.html',
  styleUrls: ['./first-load.page.scss'],
})
export class FirstLoadPage implements OnInit {

  constructor() { }

  ngOnInit() {
      var slides = document.querySelector('ion-slides');
      slides.options = {
      effect: 'flip'
    }
  }

  

}
