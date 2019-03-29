import { Component, OnInit } from '@angular/core';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-transfer',
  templateUrl: './transfer.page.html',
  styleUrls: ['./transfer.page.scss']
})
export class TransferPage implements OnInit {

  srcEndpointOpen : boolean = false;
  destEndpointOpen : boolean = false;
  transferSettingsOpen : boolean = false;

  constructor(private toastController : ToastController) { }

  ngOnInit() {
  }

  public srcEndpointClick(){
    this.srcEndpointOpen = !(this.srcEndpointOpen);
    if(this.srcEndpointOpen === true)
      this.destEndpointOpen = this.transferSettingsOpen = false;
  
  }

  public destEndpointClick(){
    this.destEndpointOpen = !(this.destEndpointOpen);
    if(this.destEndpointOpen === true)
      this.srcEndpointOpen = this.transferSettingsOpen = false;

  }

  public transferSettingsClick(){
    this.transferSettingsOpen = !(this.transferSettingsOpen);
    if(this.transferSettingsOpen === true)
      this.srcEndpointOpen = this.destEndpointOpen = false;
  }

  public intiatedTransfer(){
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
}
