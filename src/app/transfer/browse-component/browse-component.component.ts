import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { supportedProtocols, protocolToUriMap, ionicLogoMap } from '../../constants';
import { Storage } from '@ionic/storage';
import { APICallsService } from '../../apicalls.service';
import { ToastController,AlertController } from '@ionic/angular';
import { LoginPage } from 'src/app/login/login.page';
declare var window: any;

@Component({
  selector: 'app-browse-component',
  templateUrl: './browse-component.component.html',
  styleUrls: ['./browse-component.component.scss']
})
export class BrowseComponentComponent implements OnInit {

  supportedProtocols : string[] = supportedProtocols;
  ionicLogoMap : any = ionicLogoMap;
  
  select_endpoint_mode : string = 'select-endpoint'
  creds_exist_mode : string = 'creds-exist';
  browse_endpoint_contents : string = 'browse-contents';
  mode : string = this.select_endpoint_mode;

  ftpUrl:string = '';
  sftpUrl:string = '';
  credential: any = { };
  selectedEndpoint : string = '';
  selectedCred : string = '';
  selectedEndpointType : string = '';
  selectedFolder : string;
  selectedFile : string;
  selectedItem : number = -1;
  selectedEndpointCreds : [] = [];
  selectedCredContents : [] = [];
  selectedCredHistory : string[] = [];
  driveItemIdHistory : string[] = [];
  driveItemHistory : any =[];
  ftpUsername:string;
  ftpPassword:string;
  sftpUsername:string;
  sftpPassword:string;
  newFolderName: string;
  sftpFlag:boolean=false;
  startEvent : string = "loadstart";
  exitEvent : string = "exit";

  reloadTag : string = 'reload';
  displayProgressBar : boolean = false;

  dropboxOAuthRedirect : string = "https://onedatashare.org/api/stork/oauth";
  globusOAuthRedirect : string = "";

  googleDriveClientID : string = "1093251746493-hga9ltfasf35q9daqrf00rgcu1ocj3os.apps.googleusercontent.com";

  @Input() componentType : string;
  @Input() userEmail : string ;
  @Input() pwdHash : string ;

  @Output() selectionEmitter : EventEmitter<string> = new EventEmitter<string>();
  @Output() credentialEmitter : EventEmitter<string> = new EventEmitter<string>();
  @Output() typeEmitter : EventEmitter<string> = new EventEmitter<string>();
  @Output() credHistoryEmitter : EventEmitter<string[]> = new EventEmitter<string[]>();
  @Output() driveIdHistoryEmitter : EventEmitter<string[]> = new EventEmitter<string[]>();

  constructor(private apiService : APICallsService, private storage : Storage, public alertController: AlertController,
    private toastController : ToastController ) { 
    // console.log('Mode : ' + this.mode);
  }

  ngOnInit() {
    console.log('Component Type : ' + this.componentType);
    this.driveItemHistory.push({id:null,path:"googledrive:/"});
  }

  public showProgressBar(){
    this.displayProgressBar = true;
  }

  public hideProgressBar(){
    this.displayProgressBar = false;
  }

  public clearSelection(){
    this.ftpUrl = '';
    this.sftpUrl = '';
    this.selectedEndpoint = '';
    this.selectedCred = '';
    this.selectedEndpointType = '';
    this.selectedFolder = null;
    this.selectedFile = null;
    this.selectedItem = -1;
    this.sftpFlag = false;
    this.selectedEndpointCreds = [];
    this.selectedCredContents = [];
    this.selectedCredHistory = [];
    this.driveItemIdHistory = [];
    this.mode = this.select_endpoint_mode;
  }

  public exitEndpoint(){
    this.ftpUrl = '';
    this.sftpUrl = '';
    this.selectedCred = '';
    this.selectedItem = -1;
    this.sftpFlag = false;
    this.selectedCredContents = [];
    this.selectedCredHistory = [];
    this.driveItemIdHistory = [];
    this.mode = this.select_endpoint_mode;
  }

  public selectEndpoint(endpoint){
    if(endpoint !== this.reloadTag){
      this.clearSelection();
      console.log(endpoint + " selected.");
      this.selectedEndpoint = endpoint;
      this.selectedEndpointType = protocolToUriMap[this.selectedEndpoint];
      this.typeEmitter.emit(this.selectedEndpointType);
    }

    this.showProgressBar();
    this.checkIfCredentialsExist()
      .then((creds) => {
        if(creds){
          console.log("Credential for " + endpoint + " already exists");
          // this.getCredentials()
          //     .then(creds =>{
                console.log(creds);
                this.mode = this.creds_exist_mode;
                this.selectedEndpointCreds = creds;
                this.hideProgressBar();
              // });
        }
        else{
          this.startAuthentication();
        }
      });
  }
    

  public toggleMode(){
    this.mode = 'select-endpoint';
    this.emitUpdate();
  }

  public startAuthentication(){
    try{
      if(this.selectedEndpoint === "Dropbox"){ 
        this.oAuthInit(this.apiService.getDropboxOAuthLink());
      }
      else if(this.selectedEndpoint === "GoogleDrive"){
        this.googleOAuthInit();
      }
      else if(this.selectedEndpoint === "SFTP"){
        console.log("In SFTP");
        this.mode = 'sftp-auth';
      }
      else if(this.selectedEndpoint === "FTP"){
        console.log("In FTP");
        this.mode = 'ftp-auth';
      }
      else if(this.selectedEndpoint === "GridFTP"){
        this.oAuthInit(this.apiService.getGridFtpOAuthLink());
      }
      else if(this.selectedEndpoint === "HTTP"){
  
      }
      else if(this.selectedEndpoint === "SSH"){
        
      }
      this.hideProgressBar();
    }
    catch(err){
      this.hideProgressBar();
      console.log("Error occurred while performing authentication");
      console.log(err);
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
          if(Object.keys(credList).some(checker)){
            let resultArr : any[] = [];
            let index : number = 0;
            var filter = (key) => {
              if(credList[key].name.toLowerCase().indexOf(val) != -1){
                let cred = credList[key];
                cred["key"] = key;
                cred["index"] = index++;
                resultArr.push(cred);
              }
            };

            Object.keys(credList).map(filter);
            resolve(resultArr);
          }
          else
            resolve(false);
        },
        err =>{
          console.log("Error occurred while querying the credentials list");
          console.log(err);
          this.hideProgressBar();
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

          if(credList.some(checker)){
            let resultArr : any[] = [];
            let index : number = 0;
            var filter = (key) => {
              if(key.toLowerCase().indexOf(val) != -1){
                resultArr.push({'name' : key, 'key' : key, 'index' : index++});
              }
            };

            credList.forEach(filter);
            resolve(resultArr);
          }
          else
            resolve(false);
        },
        err =>{
          console.log("Error occurred while querying the credentials list");
          console.log(err);
          this.hideProgressBar();
          return false;
        });
      });
    }
  }

  public oAuthInit(oAuthLink){
    this.performOAuth(oAuthLink)
        .then((oAuthResp)=>{
          //console.log(oAuthResp);    // contains state and code
          let paramArr = oAuthResp.split("&"); 
          let state = paramArr[0].split("=")[1];
          let code = paramArr[1].split("=")[1];
          this.completeOAuth("Dropbox", state, code);
          console.log("OAuth completed!!!");
        })
        .catch(err=>{
          this.hideProgressBar();
          console.log("OAuth error : ", err);
        });
  }

  public googleOAuthInit(){
    // Google does not allow OAuth using in-app browser
      // Using a separate plugin for Google OAuth 

    console.log("Starting Google OAuth");
    window.plugins.googleplus.login(
      {
        'scopes': 'https://www.googleapis.com/auth/drive',
        'webClientId': this.googleDriveClientID,
        'offline': true 
      },
      resp => {
        console.log("Google OAuth response - " + JSON.stringify(resp)); // do something useful instead of alerting
        this.completeOAuth("GoogleDrive", null, resp["serverAuthCode"]);
        window.plugins.googleplus.disconnect(()=>{
          console.log("Google Oauth disconnected after successful token generation");
        });
      },
      err => {
        console.log("Error occurred while performing Google OAuth " + err.data);
      }
    );
  }

  public completeOAuth(protocol, state, code){
    try{
      this.apiService.completeOAuth(protocol, state, code, this.userEmail, this.pwdHash).subscribe(() =>{
        this.mode = this.select_endpoint_mode;
      });
    }
    catch(err){
      // this error will occur since we are not handling Render.redirect return value
      this.hideProgressBar();
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
                          + "&email=" + this.userEmail + "&hash=" + this.pwdHash,
                          "_blank","location=no,clearsessioncache=yes,clearcache=yes");
        browserRef.addEventListener(this.startEvent, (event : any)=>{
          if((event.url).indexOf(this.dropboxOAuthRedirect) === 0){
            browserRef.removeEventListener(this.exitEvent, (event) => {});
            browserRef.close();
            resolve((event.url).split("?")[1]);
          }
        });
      }
      catch(err){
        console.log("Error occurred while opening In-App Browser for oauth");
        this.hideProgressBar();
        reject(err);
      }
    });
  }

  public deleteCred(deleteKey : string){
    console.log("Deleting " + deleteKey);
    this.showProgressBar();
    let deleteAction = '';
    if(this.selectedEndpoint === "Dropbox" || this.selectedEndpoint === "GoogleDrive" 
      || this.selectedEndpoint === "GridFTP"){
        deleteAction = 'deleteCredential';
      }
      else{
        deleteAction = 'deleteHistory';
      }

      this.apiService.deleteCredential(deleteAction, deleteKey,this.userEmail,this.pwdHash).subscribe(
        resp=>{
          console.log(deleteKey + " deleted successfully");
          if(this.selectedEndpointCreds.length-1 === 0)
            this.mode = this.select_endpoint_mode;
          else
            this.selectEndpoint(this.reloadTag);    
          this.hideProgressBar();
        },
        err => {
          this.hideProgressBar();
          console.log("Error encountered while deleting " + deleteKey);
          console.log(err);
      });
  }

  public loadCred(credential : any){
    this.selectedCred = credential.key;
    this.selectedCredHistory = [];
    if(this.selectedEndpoint === 'FTP' || this.selectedEndpoint === 'SFTP'){
      if(this.selectedCred === undefined){
        this.selectedCred = credential;    // fix for first time load of ftp URL
        this.apiService.getFTPCreds(this.userEmail,this.pwdHash, this.selectedCred).subscribe();
      }
      this.selectedCredHistory.push(this.selectedCred);
    }
    else
      this.selectedCredHistory.push(protocolToUriMap[this.selectedEndpoint]);
    this.loadContents();

    this.credentialEmitter.emit(credential.key);
    this.emitUpdate();
  }

  async mkdirAlertBox(){
    const alert = await this.alertController.create({
      header: 'Create Directory',
      //message: msg,
      inputs: [
        {
          name: 'folderName',
          type: 'text',
          placeholder: 'Folder Name'
        }],
      buttons: [{
        text: 'Cancel',
        role: 'cancel',
        },{
        text: 'OK',
        handler: data => {
          console.log('Confirm OK: '+data.folderName);
          this.newFolderName = data.folderName;
          this.mkdir();
        }
      }],
    });
    await alert.present();
  }

  public mkdir(){
    this.showProgressBar();
    if( this.selectedEndpoint === "GoogleDrive"){
      this.apiService.mkdir(this.userEmail, this.pwdHash,  this.newFolderName, this.selectedEndpointType, 
      {"uuid" : this.selectedCred}, this.driveItemIdHistory[this.driveItemIdHistory.length-1], this.driveItemHistory)
      .subscribe(resp =>{
        console.log(resp)
        this.loadContents();
        this.hideProgressBar();
      },
      err => {
        this.hideProgressBar();
        console.log("Error occurred while executing mkdir for " + this.select_endpoint_mode);
      });            
    }else if(this.selectedEndpoint === "Dropbox"  || this.selectedEndpoint === "GridFTP" 
        || this.selectedEndpoint === "FTP" || this.selectedEndpoint === "SFTP"){

        this.apiService.mkdir(this.userEmail, this.pwdHash, this.getDirURI()+"/"+this.newFolderName, this.selectedEndpointType, 
        {"uuid" : this.selectedCred}, this.driveItemIdHistory[this.driveItemIdHistory.length-1], this.driveItemHistory)
        .subscribe(resp =>{
          console.log(resp)
          this.loadContents();
          this.hideProgressBar();
        },
        err => {
          this.hideProgressBar();
          console.log("Error occurred while executing mkdir for " + this.select_endpoint_mode);
        }); 
    }
  }


  async deleteAlertBox(){
    var msg;
    var head;
    if(this.selectedFile !=null && this.selectedFile != ""){
      msg = "Are you sure, You want to delete File <b>"+this.selectedFile+"</b>?";
      head = "Delete File";
    }else if(this.selectedCredHistory.length == 1 || this.selectedCredHistory.length == 0){
      msg = null;
      head = "Delete Folder";
    }else{
      var folder = this.selectedCredHistory[this.selectedCredHistory.length-1]
      msg = "Are you sure, You want to delete Folder <b>"+folder+"</b>?";
      head = "Delete Folder";
    }
    if(msg!=null){
      const alert = await this.alertController.create({
        header: head,
        message: msg,
        buttons: [{
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Yes',
          handler: data => {
            this.delete();
          }
        }],
      });
      await alert.present();
    }else{
      const alert = await this.alertController.create({
        header: head,
        message: "You can not delete the root folder",
        buttons: [{
          text: 'OK',
          role: 'OK',
        }],
      });
      await alert.present();
    }
  }

  public delete(){
    this.showProgressBar();
    if( this.selectedEndpoint === "GoogleDrive" || this.selectedEndpoint === "Dropbox"  || this.selectedEndpoint === "GridFTP" 
        || this.selectedEndpoint === "FTP" || this.selectedEndpoint === "SFTP"){
      this.apiService.deleteCall(this.userEmail, this.pwdHash,  this.getDirURI(), this.selectedEndpointType, 
      {"uuid" : this.selectedCred}, this.driveItemIdHistory[this.driveItemIdHistory.length-1], this.driveItemHistory)
      .subscribe(resp =>{
        console.log(resp)
        this.driveItemIdHistory.pop();
        this.selectedCredHistory.pop();
        this.driveItemHistory.pop();
        this.loadContents();
        this.hideProgressBar();
      },
      err => {
        this.hideProgressBar();
        console.log("Error occurred while executing mkdir for " + this.select_endpoint_mode);
      });            
    }else{

    }
  }


  public loadContents(){
    this.selectedFolder = null;
    this.selectedFile = null;
    this.showProgressBar();
    console.log(this.driveItemIdHistory)
    console.log(this.driveItemHistory)

    if(this.selectedEndpoint === "Dropbox" || this.selectedEndpoint === "GoogleDrive" 
                    || this.selectedEndpoint === "GridFTP"){
      this.apiService.listFiles(this.userEmail, this.pwdHash, this.getDirURI(), this.selectedEndpointType, 
        {"uuid" : this.selectedCred}, this.driveItemIdHistory[this.driveItemIdHistory.length-1])
        .subscribe(resp =>{
          this.listContentsSuccess(resp);
          this.hideProgressBar();
      },
      err => {
        this.hideProgressBar();
        console.log("Error occurred while executing ls for " + this.select_endpoint_mode);
      });
    }
    else if(this.selectedEndpoint === "FTP"){
      this.credential=null;
      this.apiService.listFiles(this.userEmail, this.pwdHash, this.getDirURI(), this.selectedEndpointType,
        this.credential, null).subscribe(resp =>{
          this.listContentsSuccess(resp);
          this.hideProgressBar();
      },
      err => {
        this.hideProgressBar();
        if(this.selectedEndpoint === "FTP")
          this.sftpFlag = true;
        console.log("Error occurred while executing ls for " + this.select_endpoint_mode);
        this.raiseToast("Login Failed.");
      });
    } else if(this.selectedEndpoint === "SFTP"){
      if(this.sftpUsername!=null && this.sftpUsername!="" && this.sftpPassword!=null && this.sftpPassword!=""){
        this.credential = {type: "userinfo", username: this.sftpUsername, password: this.sftpPassword}
        this.apiService.listFiles(this.userEmail, this.pwdHash, this.getDirURI(), this.selectedEndpointType,
        this.credential, null).subscribe(resp =>{
          this.listContentsSuccess(resp);
          this.hideProgressBar();
        },
        err => {
          this.hideProgressBar();
          console.log("Error occurred while executing ls for " + this.select_endpoint_mode);
          this.raiseToast("Login Failed.");
        });
        this.sftpUsername=null;
        this.sftpPassword=null;
      }else{
        this.sftpUrl = this.selectedCred;
        this.mode = 'sftp-auth';
        this.hideProgressBar();
      }
    }
  }

  public ftpNext(){
    console.log('Listing FTP server contents - '+ this.ftpUrl);
    this.loadCred(this.ftpUrl);
  }

  public sftpNext(){
    console.log('Listing SFTP server contents - '+ this.ftpUrl);
    this.loadCred(this.sftpUrl);
  }

  public listContentsSuccess(resp : any){
    // console.log('Listing contents - ', resp);
    let indexAddFn = (value, index) =>{
      value["index"] = index;
    };
    resp["files"].forEach(indexAddFn);
    this.selectedCredContents = resp["files"];
    this.mode = this.browse_endpoint_contents;
  }

  public fileSelected(item : any){
    console.log("ITEM1: "+item);
    if(this.componentType === 'source'){
      if(this.selectedFile !== item.name){
        if(this.selectedFile !== null){
          this.selectedCredHistory.pop();
          if(this.selectedEndpoint === 'GoogleDrive'){
            this.driveItemIdHistory.pop();
          }
            
        }

        console.log("File " + item.name + " selected");
        this.highlightItem(item.index);
        this.selectedFile = item.name;  
        this.selectedCredHistory.push(item.name);
        if(this.selectedEndpoint === 'GoogleDrive'){
          this.driveItemIdHistory.push(item.id);
        }
          
  
        this.selectedFolder = '';
      }
      this.emitUpdate();
    }
  }

  public folderSelected(item : any){
    if(this.selectedFolder !== item.name && !this.displayProgressBar){
      if(this.selectedFile !== null){
        this.selectedCredHistory.pop();
        if(this.selectedEndpoint === 'GoogleDrive'){
          this.driveItemIdHistory.pop();
          this.driveItemHistory.pop();
        }
      }

      this.selectedFolder = item.name;
      this.selectedFile = '';
      console.log("Folder " + item.name + " selected");
      this.highlightItem(item.index);
      this.selectedCredHistory.push(item.name);
      if(this.selectedEndpoint === 'GoogleDrive'){
        this.driveItemIdHistory.push(item.id);
        let name = this.driveItemHistory[this.driveItemHistory.length-1].path;
        let obj = {id: item.id, path: name+item.name+"/"}
        this.driveItemHistory.push(obj);
      }
      this.loadContents();
    }
    this.emitUpdate();
  }

  public highlightItem(index : number){
    let elem;
    if(this.selectedItem !== -1){
      elem = document.getElementById("item-" + this.selectedItem);
      if(elem !== null)
        elem.classList.remove('selected-item');
    }
    this.selectedItem = index;
    elem = document.getElementById("item-" + this.selectedItem);
    elem.classList.add('selected-item');
  }

  public contentWindowBack(){
    this.selectedFolder = '';
    // this.selectedCredHistory.pop();
    // this.driveItemIdHistory.pop();
    if(this.selectedFile !== null || this.selectedFile !== ''){
      this.selectedFile = '';
      this.selectedCredHistory.pop();
      this.driveItemIdHistory.pop();
    }
    if(this.selectedCredHistory.length === 0){
      this.mode = this.creds_exist_mode;
      this.driveItemIdHistory = [];
    } 
    else
      this.loadContents(); 
    this.emitUpdate();

    
  }

  public getDirURI() : string{
    let uri : string = this.selectedCredHistory[0];

    if(this.selectedCredHistory.length > 1 && 
      (this.selectedEndpoint === 'FTP' || this.selectedEndpoint === 'SFTP'))
      uri += '/';

    for(let i=1; i<this.selectedCredHistory.length; i++)
      uri += this.selectedCredHistory[i] + '/';

    if(this.selectedCredHistory.length === 1)
      return uri;
    else if(uri === undefined || uri === null)
      return null;
    else
      return uri.substring(0, uri.length-1);
  }

  public emitUpdate(){
    this.selectionEmitter.emit(this.getDirURI());
    this.credHistoryEmitter.emit(this.selectedCredHistory);
    this.driveIdHistoryEmitter.emit(this.driveItemIdHistory);
  }

  public raiseToast(message:string){
    this.presentToast(message);
  }
  
  async presentToast(message:string) {
    const toast = await this.toastController.create({
      message: message,
      position: 'bottom',
      duration: 2000
    });
    toast.present();
  }
}    //class