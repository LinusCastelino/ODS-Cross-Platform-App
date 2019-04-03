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

  startEvent : string = "loadstart";
  exitEvent : string = "exit";

  dropboxOAuthRedirect : string = "https://onedatashare.org/api/stork/oauth";
  gDriveOAuthRedirect : string = "";
  globusOAuthRedirect : string = "";

  constructor(private apiService : APICallsService, private storage : Storage) { }

  ngOnInit() {
  }

  public click(endpoint){
    console.log(endpoint + " selected.");
    if(endpoint === "Dropbox"){  
      this.performOAuth(this.apiService.getDropboxOAuthLink())
          .then((oAuthResp)=>{
            //console.log(oAuthResp);    // contains state and code
            try{
              this.apiService.completeOAuth(oAuthResp).subscribe();
            }
            catch(err){
              // this error will occur since we are not handling Render.redirect return value
              console.log("Expected error occurred");
            }

            console.log("OAuth completed!!!");

          })
          .catch(err=>{
            console.log("OAuth error : ", err);
          });
    }
    else if(endpoint === "Google Drive"){
      this.performOAuth(this.apiService.getGoogleDriveOAuthLink())
        .then((token)=>{
          console.log(token);
        })
        .catch(err=>{
          console.log("OAuth error : ", err);
        });
    }
    else if(endpoint === "SFTP"){

    }
    else if(endpoint === "FTP"){

    }
    else if(endpoint === "Grid FTP"){
      this.performOAuth(this.apiService.getGridFtpOAuthLink())
        .then((token)=>{
          console.log(token);
        })
        .catch(err=>{
          console.log("OAuth error : ", err);
        });
    }
    else if(endpoint === "HTTP"){

    }
    else if(endpoint === "SSH"){
      
    }
  }


  /***
   * This method opens the OAuth window for Dropbox, Google Drive and Globus
   * Reference - https://www.thepolyglotdeveloper.com/2016/01/using-an-oauth-2-0-service-within-an-ionic-2-mobile-app/
   */
  public performOAuth(oauthLink : string) : Promise<any>{

    return new Promise((resolve, reject)=>{
      try{
        this.storage.get('email')
          .then(email=>{
            this.storage.get('hash')
              .then(hash=>{
                var browserRef :any= window.cordova.InAppBrowser.open(oauthLink 
                                  + "&email=" + email + "&hash=" + hash);
                browserRef.addEventListener(this.startEvent, (event : any)=>{
                  if((event.url).indexOf(this.dropboxOAuthRedirect) === 0){
                    browserRef.removeEventListener(this.exitEvent, (event) => {});
                    browserRef.close();
                    resolve((event.url).split("?")[1] + "&email=" + email + "&hash=" + hash);
                  }
                });
              });
        });
      }
      catch(err){
        reject(err);
      }
    });
  }

}    //class
