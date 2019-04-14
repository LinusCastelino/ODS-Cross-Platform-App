import { Component, OnInit, ViewChild } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { APICallsService } from '../apicalls.service';

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

  srcEndpointOpen : boolean = true;
  srcSelection : string = null;
  srcEndpointType : string = null;
  srcCredential : string = null;
  srcCredHistory : string[] = [];
  srcDriveIdHistory : string[] = [];

  destEndpointOpen : boolean = true;
  destSelection : string = null;
  destEndpointType : string = null;
  destCredential : string = null;
  destCredHistory : string[] = [];
  destDriveIdHistory : string[] = [];

  transferSettingsOpen : boolean = true;

  constructor(private toastController : ToastController, 
              private apiService : APICallsService, private storage : Storage) {
    this.storage.get('email')
      .then(email=>{
        this.userEmail = email;
      });
    this.storage.get('hash')
      .then(hash=>{
        this.pwdHash = hash;
      });

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
    let src = {};
    let dest = {};

    src["credential"] = {"uuid" : this.srcCredential}; 
    dest["credential"] = {"uuid" : this.destCredential};

    src["type"] = this.srcEndpointType;
    dest["type"] = this.destEndpointType;

    this.destCredHistory.push(this.srcCredHistory[this.srcCredHistory.length - 1])
    src["uri"] = this.srcSelection;
    if(this.destCredHistory.length === 2)
      dest["uri"] = this.destSelection + this.destCredHistory[1];
    else
      dest["uri"] = this.destSelection + "/" + this.destCredHistory[this.destCredHistory.length - 1];

    src["map"] = this.createIdMap(this.srcCredHistory, this.srcDriveIdHistory);
    dest["map"] = this.createIdMap(this.destCredHistory, this.destDriveIdHistory);

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
    this.presentToast();
  }

  async presentToast() {
    const toast = await this.toastController.create({
      message: 'Transfer Initiated!',
      position: 'bottom',
      duration: 2000
    });
    toast.present();
  }

  public createIdMap(credHistory : string[], driveIdHistory : string[]) : Object[]{
    let idMap : Object[] = [];
    let path = credHistory[0];
    let id = null;
    let i : number = 0;
    let arrLength = credHistory.length;
    do{
      idMap.push({"id" : id, "path" : path});
      i++;
      if(i === 1)
        path += credHistory[i];
      else
        path += "/" + credHistory[i];
      id = driveIdHistory[i-1];
      id = (id === undefined)? null : id;
    }while(i < arrLength-1);

    return idMap;
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