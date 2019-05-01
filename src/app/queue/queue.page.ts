import { Component, OnInit } from '@angular/core';
import { APICallsService } from '../apicalls.service';
import { Storage } from '@ionic/storage';
//import { IQueueResp } from '../models/IQueueResp';
import { AlertController } from '@ionic/angular';
import { interval } from 'rxjs';
import { ToastController } from '@ionic/angular';


@Component({
  selector: 'app-queue',
  templateUrl: './queue.page.html',
  styleUrls: ['./queue.page.scss'],

})


export class QueuePage implements OnInit {

  private qResp : any[] = [];
  searchQuery = "";
  p: number = 1;
  rowsperPage : number = 10;
  email : any = "";
  hash :any = "";
  public innerWidth: any;
  public innerHeight: any;
  public showInfoJobId: any = 0;
  public showInfo: any = false;
  private timer : any;

  constructor(private apiService:APICallsService, private storage: Storage, public alertController: AlertController,
    private toastController : ToastController) {
      if(!this.timer)
        this.timer= this.interval();
  }

  ngOnInit() {
    var self = this;
    this.getData('email').then(function(value){
      self.email = value;
      self.getData('hash').then(function(value){
        self.hash = value;
        console.log(self.email, self.hash);
        self.queue();
      });
    });
    
    this.innerWidth = window.innerWidth;
    this.innerHeight = window.innerHeight;
    this.getNumRows(this.innerHeight);
  }

  interval(){
    return setInterval(()=>{
      this.queue();
    },2000)
  }

  getNumRows(height){
    this.rowsperPage = (height-225)/50;
  }
  
  getData(data):any{
      return this.storage.get(data).then(function(value) {
      return value;
      });
  }

  
  public searchJob(){
    console.log(this.searchQuery)
  }

  public filterList(itemList: any[]): any[] {
    let result: any[] = [];
    if(this.searchQuery == ""){
      result = itemList;
    }else{
      itemList.forEach(element => {
        if(element.src.uri.toLowerCase().indexOf(this.searchQuery.toLowerCase()) !== -1 
            || element.job_id == this.searchQuery){
          result.push(element);
        }
      });
    }
    return result;
  }
  public queue(){
    this.apiService.queue(this.email,this.hash).subscribe(
    resp => {
      var temp : any[] = Object.keys(resp);
      temp.map((x)=>{
        if(resp[x].bytes.total !=0){
          resp[x].progressbar = (resp[x].bytes.done/resp[x].bytes.total); 
          resp[x].progressPercent = Math.floor(resp[x].progressbar*100);
        }else{
          resp[x].progressbar = 0.0;
          resp[x].progressPercent = 0;
        }
        var source = resp[x].src.uri.split("/");
        if(source.length >1)
          resp[x].name = source[source.length-1]

        this.qResp = this.qResp.filter( h => h.job_id !== resp[x].job_id);
        //if(resp[x].status != "removed"){
          this.qResp.push(resp[x]);
        //}
      });
      this.qResp.sort((a, b) => { return b.job_id - a.job_id});
    },
    err => {
      console.log("Fail",err);
    });
  }

  public restartJob(jobid){
    console.log("restart",jobid);
    var email = this.storage.get('email');
    this.apiService.restartJob(jobid,this.email,this.hash).subscribe(
    resp => {
      var temp : any[] = Object.keys(resp);
      temp.map((x)=>{
        console.log("Success", resp[x]);
        this.raiseToast("Job restarted with Id");
      });
    },
    err => {
      console.log("Fail",err);
      this.raiseToast("Job Restart Failed");
    });
  }

  public deleteJob(jobid){
    console.log("delete",jobid);
    this.raiseToast("Job "+jobid+" delete in progress.");
  }

  public showJobInfo(jobid){
    console.log("ShowJob",jobid+"~"+this.showInfoJobId);
    if(this.showInfoJobId != jobid){
      this.showInfoJobId = jobid;
    }else{
      this.showInfoJobId =0;
    }
  }

  public cancelJob(jobid){
    console.log("cancel",jobid);
    this.apiService.cancelJob(jobid,this.email,this.hash).subscribe(
      resp => {
        console.log("Success", resp);
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

  ngOnDestroy(){
    clearInterval(this.timer);
    console.log("Inside Destroy");
  }
}

