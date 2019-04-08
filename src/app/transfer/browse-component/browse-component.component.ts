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

  mode : string = 'select-endpoint';
  selectedEndpoint : string;

  startEvent : string = "loadstart";
  exitEvent : string = "exit";

  userEmail : string ;
  pwdHash : string ;

  dropboxOAuthRedirect : string = "https://onedatashare.org/api/stork/oauth";
  globusOAuthRedirect : string = "";

  googleDriveClientID : string = "1093251746493-hga9ltfasf35q9daqrf00rgcu1ocj3os.apps.googleusercontent.com";

  constructor(private apiService : APICallsService, private storage : Storage) { 
    this.storage.get('email')
        .then(email=>{
          this.userEmail = email;
        });
    this.storage.get('hash')
        .then(hash=>{
          this.pwdHash = hash;
        });

    console.log('Mode : ' + this.mode);
  }

  ngOnInit() {
  }


  public checkIfCredentialsExist(endpoint) : Promise<any>{
    let val = endpoint.toLowerCase();
    return new Promise<any>((resolve, reject) =>{
      this.apiService.getCredList(this.userEmail,this.pwdHash).subscribe(credList => {
        console.log("Credentials list : " + JSON.stringify(credList));
        var checker = (key) : boolean => {
          return credList[key].name.toLowerCase().indexOf(val) != -1;
        };
        resolve(Object.keys(credList).some(checker));
      },
      err =>{
        console.log("Error occurred while querying the credentials list");
        console.log(err.data);
        return false;
      });
    })
  }

  public getCredentials(endpoint) : Promise<any>{
    let val = endpoint.toLowerCase();
    return new Promise<any>((resolve, reject) =>{
      this.apiService.getCredList(this.userEmail,this.pwdHash).subscribe(credList => {
        // console.log("Credentials list : " + JSON.stringify(credList));

        let resultArr : any[] = [];
        var filter = (key) => {
          if(credList[key].name.toLowerCase().indexOf(val) != -1)
            resultArr.push(credList[key]);
        };
        Object.keys(credList).map(filter);
        resolve(resultArr);
      },
      err =>{
        console.log("Error occurred while querying the credentials list");
        console.log(err.data);
        return {};
      });
    })
  }


  public click(endpoint){
    console.log(endpoint + " selected.");
    this.selectedEndpoint = endpoint;
    if(endpoint === "Dropbox"){ 
      this.checkIfCredentialsExist(endpoint)
      .then((exists) => {
        if(exists){
          console.log("Credential for " + endpoint + " already exists");

          this.getCredentials(endpoint)
              .then(creds =>{
                console.log(creds);

                this.mode = 'creds-exist';


              });
        }
        else{
          this.oAuthInit(this.apiService.getDropboxOAuthLink());
        }
      });
    }
    else if(endpoint === "Google Drive"){
      if(this.checkIfCredentialsExist(endpoint)){
        console.log("Credential for " + endpoint + " already exists");
      }
      else{
        this.googleOAuthInit();
      }
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


  public oAuthInit(oAuthLink){
    this.performOAuth(oAuthLink)
        .then((oAuthResp)=>{
          //console.log(oAuthResp);    // contains state and code
          let paramArr = oAuthResp.split("&"); 
          let state = paramArr[0].split("=")[1];
          let code = paramArr[1].split("=")[1];
          this.completeOAuth(state, code);
          console.log("OAuth completed!!!");

        })
        .catch(err=>{
          console.log("OAuth error : ", err);
        });
  }

  public googleOAuthInit(){
    // Google does not allow OAuth using in-app browser
      // Using a separate plugin for Google OAuth 

      window.plugins.googleplus.login(
        {
          'scopes': 'https://www.googleapis.com/auth/drive',
          'webClientId': this.googleDriveClientID,
          'offline': true 
        },
        resp => {
          console.log("Google OAuth response - " + JSON.stringify(resp)); // do something useful instead of alerting
          this.completeOAuth("GoogleDrive", resp["serverAuthCode"]);
        },
        err => {
          console.log("Error occurred while performing Google OAuth " + err.data);
        }
    );
  }

  public completeOAuth(state, code){
    try{
      this.apiService.completeOAuth(state, code, this.userEmail, this.pwdHash).subscribe();
    }
    catch(err){
      // this error will occur since we are not handling Render.redirect return value
      console.log("Expected error occurred");
    }
  }
  
  /***
   * This method opens the OAuth window for Dropbox, Google Drive and Globus
   * Reference - https://www.thepolyglotdeveloper.com/2016/01/using-an-oauth-2-0-service-within-an-ionic-2-mobile-app/
   */
  public performOAuth(oauthLink : string) : Promise<any>{

    return new Promise((resolve, reject)=>{
      try{
        var browserRef :any= window.cordova.InAppBrowser.open(oauthLink 
                          + "&email=" + this.userEmail + "&hash=" + this.pwdHash);
        browserRef.addEventListener(this.startEvent, (event : any)=>{
          if((event.url).indexOf(this.dropboxOAuthRedirect) === 0){
            browserRef.removeEventListener(this.exitEvent, (event) => {});
            browserRef.close();
            resolve((event.url).split("?")[1]);
          }
        });

      }
      catch(err){
        reject(err);
      }
    });
  }

}    //class
