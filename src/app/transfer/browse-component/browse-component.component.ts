import { Component, OnInit } from '@angular/core';
import { supportedProtocols, protocolToUriMap } from '../../constants';
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

  select_endpoint_mode : string = 'select-endpoint'
  creds_exist_mode : string = 'creds-exist';
  mode : string = this.select_endpoint_mode;

  selectedEndpoint : string;
  selectedEndpointCreds : [] = [];

  startEvent : string = "loadstart";
  exitEvent : string = "exit";

  reloadTag : string = 'reload';
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

  public click(endpoint){
    if(endpoint !== this.reloadTag){
      console.log(endpoint + " selected.");
      this.selectedEndpoint = endpoint;
    }

    this.checkIfCredentialsExist()
      .then((exists) => {
        if(exists){
          console.log("Credential for " + endpoint + " already exists");
          this.getCredentials()
              .then(creds =>{
                console.log(creds);
                this.mode = this.creds_exist_mode;
                this.selectedEndpointCreds = creds;
              });
        }
        else{
          this.startAuthentication();
        }
      });
  }
    

  public toggleMode(){
    this.mode = 'select-endpoint';
  }

  public startAuthentication(){
    if(this.selectedEndpoint === "Dropbox"){ 
      this.oAuthInit(this.apiService.getDropboxOAuthLink());
    }
    else if(this.selectedEndpoint === "Google Drive"){
      this.googleOAuthInit();
    }
    else if(this.selectedEndpoint === "SFTP"){

    }
    else if(this.selectedEndpoint === "FTP"){
      console.log("Here");
    }
    else if(this.selectedEndpoint === "Grid FTP"){
      this.oAuthInit(this.apiService.getGridFtpOAuthLink());
    }
    else if(this.selectedEndpoint === "HTTP"){

    }
    else if(this.selectedEndpoint === "SSH"){
      
    }
  }

  public checkIfCredentialsExist() : Promise<any>{
    let val = this.selectedEndpoint.toLowerCase();
    
    if(this.selectedEndpoint === "Dropbox" || this.selectedEndpoint === "GoogleDrive" 
                    || this.selectedEndpoint === "GridFTP"){
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
      });
    }
    else if(this.selectedEndpoint === "FTP" || this.selectedEndpoint === "SFTP"){
      return new Promise<any>((resolve, reject) =>{
        this.apiService.getFTPCreds(this.userEmail,this.pwdHash).subscribe(credList => {
          console.log("Credentials list : " + JSON.stringify(credList));
          var checker = (key) : boolean => {
            return key.toLowerCase().indexOf(val) != -1;
          };
          resolve(credList.some(checker));
        },
        err =>{
          console.log("Error occurred while querying the credentials list");
          console.log(err.data);
          return false;
        });
      });
    }
  }


  public getCredentials() : Promise<any>{
    return new Promise<any>((resolve, reject) =>{

      let val = this.selectedEndpoint.toLowerCase();
      if(this.selectedEndpoint === "Dropbox" || this.selectedEndpoint === "GoogleDrive" 
                    || this.selectedEndpoint === "GridFTP"){
        this.apiService.getCredList(this.userEmail,this.pwdHash).subscribe(credList => {
          // console.log("Credentials list : " + JSON.stringify(credList));
          
          let resultArr : any[] = [];
          
            var filter = (key) => {
              if(credList[key].name.toLowerCase().indexOf(val) != -1){
                let cred = credList[key];
                cred["key"] = key;
                resultArr.push(cred);
              }
            };

            Object.keys(credList).map(filter);
          resolve(resultArr);
        },
        err =>{
          console.log("Error occurred while querying the credentials list");
          console.log(err.data);
          return {};
        });
      }
      else if(this.selectedEndpoint === "FTP" || this.selectedEndpoint === "SFTP"){
        this.apiService.getFTPCreds(this.userEmail,this.pwdHash).subscribe(credList => {
          // console.log("Credentials list : " + JSON.stringify(credList));

          let resultArr : any[] = [];
          var filter = (key) => {
            if(key.toLowerCase().indexOf(val) != -1){
              resultArr.push({'name' : key, 'key' : key});
            }
              
          };

          credList.forEach(filter);
          resolve(resultArr);
        },
        err =>{
          console.log("Error occurred while querying the credentials list");
          console.log(err.data);
          return {};
        });
      }
  });
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

  public deleteCred(deleteKey : string){
    this.apiService.deleteCredential(deleteKey,this.userEmail,this.pwdHash).subscribe(
      resp=>{
        console.log(deleteKey + " deleted successfully");
        if(this.selectedEndpointCreds.length-1 === 0)
          this.mode = this.select_endpoint_mode;
        else
          this.click(this.reloadTag);
      },
      err => {
        console.log("Error encountered while deleting " + deleteKey);
    });
  }

  public listContents(credential : string){
    let uri = protocolToUriMap[this.selectedEndpoint];
    if(this.selectedEndpoint === "Dropbox" || this.selectedEndpoint === "GoogleDrive" 
                    || this.selectedEndpoint === "GridFTP"){

      this.apiService.listFiles(this.userEmail, this.pwdHash, uri, uri, 
        {"uuid" : credential}, null).subscribe(resp =>{
          console.log(resp);
      });
    }
    else if(this.selectedEndpoint === "FTP" || this.selectedEndpoint === "SFTP"){
      this.apiService.listFiles(this.userEmail, this.pwdHash, credential, uri, null, null).subscribe(resp =>{
        console.log(resp);
      });
    }
  }
}    //class
