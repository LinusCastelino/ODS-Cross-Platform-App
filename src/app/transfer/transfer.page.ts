import { Component, OnInit } from '@angular/core';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-transfer',
  templateUrl: './transfer.page.html',
  styleUrls: ['./transfer.page.scss']
})
export class TransferPage implements OnInit {

  srcEndpointOpen : boolean = true;
  destEndpointOpen : boolean = true;
  transferSettingsOpen : boolean = true;

  constructor(private toastController : ToastController) { }

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
