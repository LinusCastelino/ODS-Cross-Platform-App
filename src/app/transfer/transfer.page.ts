import { Component, OnInit, ViewChild } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { APICallsService } from '../apicalls.service';
import { Router } from '@angular/router';
import { HelperService } from '../helper.service';

@Component({
  selector: 'app-transfer',
  templateUrl: './transfer.page.html',
  styleUrls: ['./transfer.page.scss']
})
export class TransferPage implements OnInit {

  @ViewChild('source') sourceComponent;
  @ViewChild('destination') destComponent;

  TAG : string = 'Transfer Component';

  userEmail : string ;
  pwdHash : string ;

  srcEndpointOpen : boolean = true;    // toggle flag for source dropdown
  srcSelection : string = null;    // holds the uri of the entity selected in src window
  srcEndpointType : string = null;    // holds the type of endpoint
  srcCredential : any = null;    // credential object (usually contians uuid and name)
  srcCredHistory : string[] = [];    // selection history of the user for the endpoint
  srcDriveIdHistory : string[] = [];    // Google drive specific selection history

  destEndpointOpen : boolean = true;    // toggle flag for destination dropdown
  destSelection : string = null;    // holds the uri of the entity selected in destination window
  destEndpointType : string = null;
  destCredential : any = null;
  destCredHistory : string[] = [];
  destDriveIdHistory : string[] = [];

  transferSettingsOpen : boolean = true;    // toggle flag for transfer settings dropdown

  constructor(private toastController : ToastController, private apiService : APICallsService, 
              private storage : Storage, private router : Router, private helperService : HelperService) {
                
    // security check if somehow user manages to get to transfer page bypassing AuthGuard
    this.storage.get('email')
      .then(email=>{
        if(email !== null)
          this.userEmail = email;
        else{
          this.router.navigate(['/login']);
          throw 'Email in storage is null';
        }
      })
      .catch(err =>{
        let msg = 'Error occurred while fetching email from storage';
        console.log(msg);
        this.presentToast(msg);
        console.log(err);
        this.router.navigate(['/login']);
      });
    this.storage.get('hash')
      .then(hash=>{
        if(hash !== null)
          this.pwdHash = hash;
        else{
          this.router.navigate(['/login']);
          throw 'Hash in storage is null';
        }
      })
      .catch(err =>{
        let msg = 'Error occurred while fetching password hash from storage';
        console.log(msg);
        this.presentToast(msg);
        console.log(err);
        this.router.navigate(['/login']);
      });;
   }

  ngOnInit() {
  }

  public srcEndpointClick(){
    this.srcEndpointOpen = !(this.srcEndpointOpen);
    if(this.srcEndpointOpen === false)
      this.destEndpointOpen = this.transferSettingsOpen = true;
  
  }

  public destEndpointClick(){
    this.destEndpointOpen = !(this.destEndpointOpen);
    if(this.destEndpointOpen === false)
      this.srcEndpointOpen = this.transferSettingsOpen = true;
  }

  public transferSettingsClick(){
    this.transferSettingsOpen = !(this.transferSettingsOpen);
    if(this.transferSettingsOpen === false)
      this.srcEndpointOpen = this.destEndpointOpen = true;
  }

  public initiateTransfer(){
    if(this.srcSelection === null || this.srcSelection === '' ||
       this.destSelection === null || this.destSelection === ''){
      // if initiate transfer button is clicked without selecting endpoints
      console.log("Error in triggering transfer");
      console.log(this.srcSelection);
      console.log(this.destSelection);

      this.presentToast('Please select valid source and destination endpoints.');
    }
    else{

      let src = {};
      let dest = {};

      if(!(this.srcCredential ===null || this.srcCredential === undefined))
        src["credential"] = this.srcCredential; 

      if(!(this.destCredential ===null || this.destCredential === undefined))
        dest["credential"] = this.destCredential;

      src["type"] = this.srcEndpointType;
      dest["type"] = this.destEndpointType;

      this.destCredHistory.push(this.srcCredHistory[this.srcCredHistory.length - 1])
      src["uri"] = encodeURI(this.srcSelection);
      if(this.destCredHistory.length === 2){
        if(this.destSelection.endsWith("/"))
          dest["uri"] = encodeURI(this.destSelection + this.destCredHistory[1]);
        else
          dest["uri"] = encodeURI(this.destSelection + "/" + this.destCredHistory[1]);    // for ftp and sftp
      }
      else
        dest["uri"] = encodeURI(this.destSelection + "/" + this.destCredHistory[this.destCredHistory.length - 1]);

      src["map"] = this.helperService.createIdMap(this.srcCredHistory, this.srcDriveIdHistory, "submit");
      dest["map"] = this.helperService.createIdMap(this.destCredHistory, this.destDriveIdHistory, "submit");

      if(this.srcDriveIdHistory.length > 0)
        src["id"] = this.srcDriveIdHistory[this.srcDriveIdHistory.length - 1];
      else
        src["id"] = null;

      if(this.destDriveIdHistory.length > 0)
        dest["id"] = this.destDriveIdHistory[this.destDriveIdHistory.length - 1];
      else
        dest["id"] = null;

      // setting default options 
      // until optimization features are implemented
      let options = {
        compress: true,
        encrypt: true,
        optimizer: "None",
        overwrite: true,
        retry: 5,
        verify: true,
      }

      this.apiService.submit(this.userEmail, this.pwdHash, src, dest, options).subscribe();
      this.clearSrcSelection();
      this.clearDestSelection();
      this.presentToast('Transfer Initiated!\nPlease check Queue screen for progress.');
    }
  }

  async presentToast(msg : string) {
    const toast = await this.toastController.create({
      message: msg,
      position: 'bottom',
      duration: 2000
    });
    toast.present();
  }

  public handleSrcSelection(selection : string){
    console.log(this.TAG + " : Source uri - " + selection);
    this.srcSelection = selection;
  }

  public handleDestSelection(selection : string){
    console.log(this.TAG + " : Destination uri - " + selection);
    this.destSelection = selection;
  }

  public handleSrcType(endpointType : string){
    console.log(this.TAG + " : Source endpoint type - " + endpointType);
    this.srcEndpointType = endpointType;
  }

  public handleDestType(endpointType : string){
    console.log(this.TAG + " : Destination endpoint type - " + endpointType);
    this.destEndpointType = endpointType;
  }

  public handleSrcCredential(credential : string){
    // console.log(this.TAG + " : Source credential selected - " + credential);
    this.srcCredential = credential;
  }

  public handleDestCredential(credential : string){
    // console.log(this.TAG + " : Destination credential selected - " + credential);
    this.destCredential = credential;
  }

  public handleSrcCredHistory(credHistory : string[]){
    // console.log(this.TAG + " : Source Cred History - ", credHistory);
    this.srcCredHistory = credHistory;
  }

  public handleDestCredHistory(credHistory : string[]){
    // console.log(this.TAG + " : Destination Cred History - ", credHistory);
    this.destCredHistory = credHistory;
  }

  public handleSrcDriveIdHistory(driveIdHistory : string[]){
    console.log(this.TAG + " : Source Drive ID History - ", driveIdHistory);
    this.srcDriveIdHistory = driveIdHistory;
  }

  public handleDestDriveIdHistory(driveIdHistory : string[]){
    console.log(this.TAG + " : Destination Drive ID History - ", driveIdHistory);
    this.destDriveIdHistory = driveIdHistory;
  }

  public clearSrcSelection(){
    console.log(this.TAG + " : Source selection cleared");
    this.srcSelection = null;
    this.srcEndpointType = null;
    this.srcCredential = null;
    this.srcCredHistory = [];
    this.srcDriveIdHistory = [];
    this.sourceComponent.clearSelection();
  }

  public clearDestSelection(){
    console.log(this.TAG + " : Destination selection cleared");
    this.destSelection = null;
    this.destEndpointType = null;
    this.destCredential = null;
    this.destCredHistory = [];
    this.destDriveIdHistory = [];
    this.destComponent.clearSelection();
  }
}