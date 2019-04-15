import { Component, OnInit } from '@angular/core';
// import { Component } from '@angular/core';
import { Storage } from '@ionic/storage';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
// export class TabsPage implements OnInit{

//   constructor(private storage : Storage) { 
    
//   }
//   isAdmin:boolean = false;

//   ngOnInit() {
//     var self = this;
//     this.getData('isAdmin').then(function(value){
//     self.isAdmin = value;
//   });
//   }
//   getData(data):any{
//     return this.storage.get(data).then(function(value) {
//       return value;
//     });
//     }
//  }
export class TabsPage { 

  isAdmin : boolean = false;

  constructor(private storage : Storage){
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
}

