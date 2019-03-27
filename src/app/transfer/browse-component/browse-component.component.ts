import { Component, OnInit } from '@angular/core';
import { supportedProtocols } from '../../constants';
import { Storage } from '@ionic/storage';
import { APICallsService } from '../../apicalls.service';

declare var window: any;

@Component({
  selector: 'app-browse-component',
  templateUrl: './browse-component.component.html',
  styleUrls: ['./browse-component.component.scss']
})
export class BrowseComponentComponent implements OnInit {

  supportedProtocols : string[] = supportedProtocols;

  constructor(private apiService : APICallsService, private storage : Storage) { }

  ngOnInit() {
  }

  public click(endpoint){
    console.log(endpoint + " selected.");
    if(endpoint === "Dropbox"){
      this.storage.get('email')
          .then(email=>{
              this.storage.get('hash')
                  .then(hash=>{
                      var browserRef = window.cordova.InAppBrowser.open(this.apiService.getDropboxOAuthLink() 
                                       + "&email=" + email + "&hash=" + hash)});
                  });
      
    }
    else if(endpoint === "Google Drive"){

    }
    else if(endpoint === "SFTP"){

    }
    else if(endpoint === "FTP"){

    }
    else if(endpoint === "Grid FTP"){

    }
    else if(endpoint === "HTTP"){

    }
    else if(endpoint === "SSH"){
      
    }
  }

}
