import { Component } from '@angular/core';
import { Storage } from '@ionic/storage';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
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

