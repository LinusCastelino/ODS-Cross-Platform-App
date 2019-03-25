import { Component, OnInit } from '@angular/core';
import { supportedProtocols } from '../../constants';
import { APICallsService } from '../../apicalls.service';

declare var window: any;

@Component({
  selector: 'app-browse-component',
  templateUrl: './browse-component.component.html',
  styleUrls: ['./browse-component.component.scss']
})
export class BrowseComponentComponent implements OnInit {

  supportedProtocols : string[] = supportedProtocols;

  constructor(private apiService : APICallsService) { }

  ngOnInit() {
  }

  public click(endpoint){
    console.log(endpoint + " selected.");
    if(endpoint === "Dropbox"){
      var browserRef = window.cordova.InAppBrowser.open(this.apiService.getDropboxOAuthLink());
      // window.open(this.apiService.getDropboxOAuthLink());
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
