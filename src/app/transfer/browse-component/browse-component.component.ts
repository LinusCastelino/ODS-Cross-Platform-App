import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { supportedProtocols, protocolToUriMap, ionicLogoMap } from '../../constants';
import { Storage } from '@ionic/storage';
import { APICallsService } from '../../apicalls.service';
import { ToastController,AlertController } from '@ionic/angular';
import { HelperService } from 'src/app/helper.service';
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

  ftpUrl:string = '';    // FTP server url entered by user
  sftpUrl:string = '';    // SFTP URL entered by user
  credential: any = null;    // object containing the uuid and name of the selected credential. is passed to transfer component
  selectedEndpoint : string = '';    // holds the protocol selected by the user
  selectedEndpointCreds : [] = [];    // holds the credentials list sent by the server for the endpoint selected by the user
  selectedCred : string = '';    // holds the credential (sent by the server) for the endpoint (protocol) selected by the user
  selectedEndpointType : string = '';    // stores the type value for the protocol selected by the user.
  selectedFolder : string;    // holds the name of current the folder the user is in.
  selectedFile : string;    // holds the name of the file selected by the user
  selectedItem : number = -1;    // temporary variable used to add and remove highlight classes when user selects an item in the browse window
  selectedCredContents : [] = [];    // holds the items (files/folders) for the current selection
  selectedCredHistory : string[] = [];    // maintains a history of all user selections for the current browse window
  driveItemIdHistory : string[] = [];    // maintians the history of all user selection in the browse window specifically for Google Drive
  ftpUsername:string;    // stores the username entered by user for FTP endpoint with passwords
  ftpPassword:string;    // stores the password entered by user for FTP endpoint with passwords
  sftpUsername:string;    // stores the username entered by user for SFTP endpoint
  sftpPassword:string;     // stores the password entered by user for SFTP endpoint
  sftpFlag:boolean=false;    // a flag to toggle credentials text boxes if the ftp server is a secure ftp

  // constants used for OAuth
  startEvent : string = "loadstart";
  exitEvent : string = "exit";
  dropboxOAuthRedirect : string = "https://onedatashare.org/api/stork/oauth";
  globusOAuthRedirect : string = "";
  googleDriveClientID : string = "1093251746493-hga9ltfasf35q9daqrf00rgcu1ocj3os.apps.googleusercontent.com";

  reloadTag : string = 'reload';
  displayProgressBar : boolean = false;

  @Input() componentType : string;
  @Input() userEmail : string ;
  @Input() pwdHash : string ;

  @Output() selectionEmitter : EventEmitter<string> = new EventEmitter<string>();
  @Output() credentialEmitter : EventEmitter<string> = new EventEmitter<string>();
  @Output() typeEmitter : EventEmitter<string> = new EventEmitter<string>();
  @Output() credHistoryEmitter : EventEmitter<string[]> = new EventEmitter<string[]>();
  @Output() driveIdHistoryEmitter : EventEmitter<string[]> = new EventEmitter<string[]>();

  constructor(private apiService : APICallsService, private storage : Storage, public alertController: AlertController,
              private toastController : ToastController, private helperService : HelperService ) { 
    // console.log('Mode : ' + this.mode);
  }

  ngOnInit() {
    console.log('Component Type : ' + this.componentType);
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
    this.sftpUsername = null;
    this.sftpPassword = null;
    this.credential = null;
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
    this.credential = null;
    this.selectedItem = -1;
    this.sftpFlag = false;
    this.sftpUsername = null;
    this.sftpPassword = null;
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
    else{
      console.log('Reloading....')
    }

    this.showProgressBar();
    this.checkIfCredentialsExist()
      .then((creds) => {
        if(creds){
          console.log("Credential for " + endpoint + " already exists");
          console.log(JSON.stringify(creds));
          this.selectedEndpointCreds = creds;
          this.mode = this.creds_exist_mode;
          this.hideProgressBar();
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
        this.sftpUrl = null;
        this.sftpUsername=null;
        this.sftpPassword=null;
        this.mode = 'sftp-auth';
        this.hideProgressBar();
      }
      else if(this.selectedEndpoint === "FTP"){
        this.ftpUrl = null;
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
            return key.toLowerCase().startsWith(val);
          };

          if(credList.some(checker)){
            let resultArr : any[] = [];
            let index : number = 0;
            var filter = (key) => {
              if(key.toLowerCase().startsWith(val)){
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

    this.showProgressBar();
    setTimeout(()=>{
      this.selectEndpoint(this.reloadTag)}
      , 1000); // wait for 1 second so that the redirection error occurs before sending the creds request.
  }
  
  /***
   * This method opens the OAuth window for Dropbox and Globus
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

  public loadCred(cred : any){
    this.selectedCred = cred.key;
    this.selectedCredHistory = [];

    if(this.selectedEndpoint === 'FTP'){
      if(this.selectedCred === undefined){
        // fix for first time load of ftp by entering URL
        this.selectedCred = cred;    
        // making a call to API so that the newly entered cred gets saved in database
        this.apiService.getFTPCreds(this.userEmail,this.pwdHash, this.selectedCred).subscribe();
        this.selectedCredHistory.push(this.selectedCred);
      }
      else{
        this.selectedCredHistory.push(this.selectedCred);
        this.credential = null;
        this.credentialEmitter.emit(this.credential);
      }
    }
    else if(this.selectedEndpoint === 'SFTP' && (this.sftpUsername === null || this.sftpPassword === null)){
      this.sftpUrl = this.selectedCred;
      this.mode = 'sftp-auth';
      this.hideProgressBar();
    }
    else if(this.selectedEndpoint === 'SFTP' && this.sftpUsername !== null && this.sftpPassword !== null){
      this.selectedCred = cred;
      this.selectedCredHistory.push(this.selectedCred);
      this.apiService.getFTPCreds(this.userEmail,this.pwdHash, this.selectedCred).subscribe();
    }
    else{
      this.selectedCredHistory.push(protocolToUriMap[this.selectedEndpoint]);

      //for Dropbox and Drive create credential object and send to parent
      // for sftp credential is set in sftpNext()
      this.credential = {"uuid" : cred.key, "name" : cred.name};
      this.credentialEmitter.emit(this.credential);
    }

    this.loadContents();
    this.emitUpdate();
  }

  async mkdirAlertBox(){
    const alert = await this.alertController.create({
      header: 'Create Directory',
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
          this.mkdir(data.folderName);
        }
      }],
    });
    await alert.present();
  }

  public mkdir(newFolderName : string){
    this.showProgressBar();
    this.apiService.mkdir(this.userEmail, this.pwdHash,  this.getFormattedNewFolderName(newFolderName), this.selectedEndpointType, 
                          this.credential, this.driveItemIdHistory[this.driveItemIdHistory.length-1], 
                          this.helperService.createIdMap(this.selectedCredHistory, this.driveItemIdHistory, "mkdir"))
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

  public getFormattedNewFolderName(newFolderName : string) : string{
    if( this.selectedEndpoint === "GoogleDrive")
      return newFolderName;
    else if(this.selectedEndpoint === "Dropbox"  || this.selectedEndpoint === "GridFTP" || 
            this.selectedEndpoint === "FTP" || this.selectedEndpoint === "SFTP") {
      var curUri = this.getDirURI();
      if(curUri.endsWith("/"))    // mkdir in root dir
      return this.getDirURI()+newFolderName;
      else
        return this.getDirURI()+"/"+newFolderName;
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
    if( this.selectedEndpoint === "GoogleDrive" || this.selectedEndpoint === "Dropbox"  || this.selectedEndpoint === "GridFTP" 
        || this.selectedEndpoint === "FTP" || this.selectedEndpoint === "SFTP"){
      this.apiService.deleteCall(this.userEmail, this.pwdHash,  this.getDirURI(), this.selectedEndpointType, 
                                {"uuid" : this.selectedCred}, this.driveItemIdHistory[this.driveItemIdHistory.length-1], 
                                this.helperService.createIdMap(this.selectedCredHistory, this.driveItemIdHistory, "delete"))
      .subscribe(resp =>{
        console.log(resp)
        this.driveItemIdHistory.pop();
        this.selectedCredHistory.pop();
        this.loadContents();
        this.raiseToast("Deleted successfully.");
      },
      err => {
        this.raiseToast("Error occurred while deleting.");
        console.log("Error occurred while executing delete for" );
      });            
    }
  }


  public loadContents(){
    this.selectedFolder = null;
    this.selectedFile = null;
    this.showProgressBar();
    console.log(this.driveItemIdHistory)
    // console.log(this.driveItemHistory)

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
    else if(this.selectedEndpoint === "FTP" || this.selectedEndpoint === "SFTP"){
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
    } 
  }

  public ftpNext(){
    console.log('Listing FTP server contents - '+ this.ftpUrl);
    this.credential = null;
    this.loadCred(this.ftpUrl);
  }

  public sftpNext(){
    console.log('Listing SFTP server contents - '+ this.sftpUrl);
    this.credential = {type: "userinfo", username: this.sftpUsername, password: this.sftpPassword};
    this.credentialEmitter.emit(this.credential);
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
          // this.driveItemHistory.pop();
        }
      }

      this.selectedFolder = item.name;
      this.selectedFile = '';
      console.log("Folder " + item.name + " selected");
      this.highlightItem(item.index);
      this.selectedCredHistory.push(item.name);
      if(this.selectedEndpoint === 'GoogleDrive'){
        this.driveItemIdHistory.push(item.id);
        // let name = this.driveItemHistory[this.driveItemHistory.length-1].path;
        // let obj = {id: item.id, path: name+item.name+"/"}
        // this.driveItemHistory.push(obj);
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
    if(this.selectedFile !== null || this.selectedFile !== ''){
      this.selectedFile = '';
      this.selectedCredHistory.pop();
      this.driveItemIdHistory.pop();
    }
    if(this.selectedCredHistory.length === 0){
      this.mode = this.creds_exist_mode;
      this.driveItemIdHistory = [];
      this.credential = null;
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