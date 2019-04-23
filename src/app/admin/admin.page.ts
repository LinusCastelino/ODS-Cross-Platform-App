import { Component, OnInit } from '@angular/core';
import { APICallsService } from '../apicalls.service';
import { Storage } from '@ionic/storage';
// import { IQueueResp } from '../models/IQueueResp';
import { AlertController } from '@ionic/angular';
import { interval } from 'rxjs';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.page.html',
  styleUrls: ['./admin.page.scss'],
})
export class AdminPage implements OnInit {
  private qResp : any[] = [];
  private clientList : any[] = [];
  email = "";
  hash = "";
  searchQuery = "";
  public innerWidth: any;
  public innerHeight: any;
  rowsperPage : number = 10;
  clientsPerPage : number = 4;
  constructor(private apiService:APICallsService, private storage: Storage, public alertController: AlertController, 
      private toastController : ToastController) {

    interval(2000).subscribe(x => {
      this.queue();
    });
  }

  ngOnInit() {
    var self = this;
    this.getData('email').then(function(value){
      self.email = value;
      self.getData('hash').then(function(value){
        self.hash = value;
        self.queue();
        self.getClientInfo();
      });
    });

    this.innerWidth = window.innerWidth;
    this.innerHeight = window.innerHeight;
    //console.log(this.innerWidth,this.innerHeight);
    this.getNumRows(this.innerHeight);
  }
  getData(data):any{
      return this.storage.get(data).then(function(value) {
      return value;
      });
    }
  getNumRows(height){
    this.rowsperPage = (height-270)/70;
  }

  public filterClientList(itemList: any[]): any[] {
    let result: any[] = [];
    if(this.searchQuery == ""){
      result = itemList;
    }else{
      itemList.forEach(element => {
        if(element.email.toLowerCase().indexOf(this.searchQuery.toLowerCase()) !== -1){
          result.push(element);
        }
      });
    }
    return result;
  }

  public filterList(itemList: any[]): any[] {
    let result: any[] = [];
    if(this.searchQuery == ""){
      result = itemList;
    }else{
      itemList.forEach(element => {
        if(element.job_id == this.searchQuery || element.owner.toLowerCase().indexOf(this.searchQuery.toLowerCase()) !== -1){
          result.push(element);
        }
      });
    }
    return result;
  }



  public getClientInfo(){
    this.apiService.getClientInfo(this.email,this.hash).subscribe(
      resp => {
        var temp : any[] = Object.keys(resp);
        temp.map((x)=>{
          this.clientList.push(resp[x]);
        });
        console.log("Client", this.clientList);
      },
      err => {
        console.log("Fail",err);
      });
  }

  public queue(){
    this.apiService.queue(this.email, this.hash).subscribe(
    resp => {
      var temp : any[] = Object.keys(resp);
      temp.map((x)=>{
          if(resp[x].bytes.total !=0){
            resp[x].progressbar = (resp[x].bytes.done/resp[x].bytes.total); 
          }else{
            resp[x].progressbar = 0.0;
          }
          this.qResp = this.qResp.filter( h => h.job_id !== resp[x].job_id);
          this.qResp.push(resp[x]);
      });
      this.qResp.sort((a, b) => { return b.job_id - a.job_id});
    },
    err => {
      console.log("Fail",err);
    });
  }


  async infoJob(jobid) {
    try {
      var obj = this.qResp.find(x => x.job_id == jobid);
      var duration = ((obj.times.completed - obj.times.started)/1000).toFixed(2);
      var scheduledDate = new Date(obj.times.scheduled);
      var startedDate = new Date(obj.times.started);
      var completedDate = new Date(obj.times.completed);
      console.log(obj);
      var msg = "<div class='alertBox'><b>Source:</b> "+obj.src.uri+"</br><b>Destination:</b> "+obj.dest.uri
                +"</br><b>Instant Speed:</b> "+this.renderSpeed(obj.bytes.inst)+"</br><b>Average Speed:</b> "+this.renderSpeed(obj.bytes.avg)
                +"</br><b>Scheduled Time:</b> "+this.getFormattedDate(scheduledDate)+"</br><b>Started Time:</b> "+this.getFormattedDate(startedDate)
                +"</br><b>Completed Time:</b> "+this.getFormattedDate(completedDate)+"</br><b>Time Duration:</b> "+duration
                +"</br><b>Attempts:</b> "+obj.attempts+"</br><b>Status:</b> "+obj.status+"</div>";
      const alert = await this.alertController.create({
        header: 'Info of JobID ['+obj.job_id+']',
        subHeader: 'User: '+obj.owner,
        message: msg,
        buttons: ['OK'],
      });
      await alert.present();
    } catch (error) {
      this.raiseToast("No info available for this Job");
    }
    
  }

  async infoUsers(email) {
    try {
      var obj = this.clientList.find(x => x.email == email);
      var fName = obj.firstName;
      var lName = obj.lastName;
      var signUp :any ="";
      var lastActivity :any ="";
      if(obj.registerMoment >0){
        signUp = new Date(obj.registerMoment);
      }
      if(obj.lastActivity >0){
        lastActivity = new Date(obj.lastActivity);
      }
      if(fName == null){
        fName ="";
      }
      if(lName == null){
        lName ="";
      }
      var msg = "<div class='alertBox'><b>First Name:</b> "+fName+"</br><b>Last Name:</b> "+lName
                +"</br><b>Last Activity:</b> "+lastActivity;

      const alert = await this.alertController.create({
        header: 'User Info',
        subHeader: obj.email,
        message: msg,
        buttons: ['OK'],
      });
      await alert.present();
    } catch (error) {
      this.raiseToast("No info available for this User");
    }
    
  }

  getFormattedDate(d){
		return (d.getMonth() + '/' + d.getDate() + '/' + d.getFullYear() + ' ' + d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds());
	}
	renderSpeed(speedInBps){
		var displaySpeed = "";
		if(speedInBps > 1000000000){
			displaySpeed = (speedInBps/1000000000).toFixed(2) + " GB/s";
		}
		else if(speedInBps > 1000000){
			displaySpeed = (speedInBps/1000000).toFixed(2) + " MB/s";
		}
		else if(speedInBps > 1000){
			displaySpeed = (speedInBps/1000).toFixed(2) + " KB/s";
		}
		else{
			displaySpeed = speedInBps + " B/s";
		}
		return displaySpeed;
  }
  

  public raiseToast(message:string){
    this.presentToast(message);
  }
  async presentToast(message:string) {
    const toast = await this.toastController.create({
      message: message,
      position: 'bottom',
      duration: 1200
    });
    toast.present();
  }
}
