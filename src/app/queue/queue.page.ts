import { Component, OnInit } from '@angular/core';
import { APICallsService } from '../apicalls.service';
import { Storage } from '@ionic/storage';
//import { IQueueResp } from '../models/IQueueResp';
//import { queryRefresh } from '@angular/core/src/render3';
import { AlertController } from '@ionic/angular';
import { interval } from 'rxjs';
import * as _ from 'lodash';
//import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-queue',
  templateUrl: './queue.page.html',
  styleUrls: ['./queue.page.scss'],

})


export class QueuePage implements OnInit {

  //private bodyText: string;
  private qResp : any[] = [];
  searchQuery = "";
  //email = "vanditsa@buffalo.edu";
  //hash = "96ec973856c6b64e048ebea1231eff01c57e261ed404e365f3b01c04225fdc6d";
  p: number = 1;
  rowsperPage : number = 10;
  email : any = "";
  hash :any = "";
  public innerWidth: any;
  public innerHeight: any;

  constructor(private apiService:APICallsService, private storage: Storage, public alertController: AlertController) {
    interval(6000).subscribe(x => {
      //this.qResp = [];
      //this.queue();
    });
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
    console.log(this.innerWidth,this.innerHeight);
    this.getNumRows(this.innerHeight);
  }

  getNumRows(height){
    this.rowsperPage = (height-225)/40;
  }
  
  getData(data):any{
      return this.storage.get(data).then(function(value) {
      return value;
      });
  }

  // @HostListener('window:resize', ['$event'])
  // onResize(event) {
  //   this.innerWidth = window.innerWidth;
  // }
  
  public searchJob(){
    //console.log(event)
    console.log(this.searchQuery)
  }

  public filterList(itemList: any[]): any[] {
    let result: any[] = [];
    if(this.searchQuery == ""){
      result = itemList;
    }else{
      itemList.forEach(element => {
        if(element.job_id == this.searchQuery){
          result.push(element);
        }
      });
    }
    return result;
  }
  public queue(){
    console.log("Queue")
    //var email = this.storage.get('email');
    //var hash = this.storage.get('hash');
    this.apiService.queue(this.email,this.hash).subscribe(
    resp => {
      var temp : any[] = Object.keys(resp);
      //this.qResp = temp;
      temp.map((x)=>{
         //console.log(resp[x].job_id,resp[x])
          if(resp[x].bytes.total !=0){
            resp[x].progressbar = (resp[x].bytes.done/resp[x].bytes.total); 
          }else{
            resp[x].progressbar = 0.0;
          }
          //  var flag = false;
          //  this.qResp.forEach(element => {
          //    flag = _.isEqual(element, resp[x]);
          //    console.log(flag);
          //  });
          // if(!flag){
            this.qResp.push(resp[x]);
          // }else{
          //   console.log("Match");
          // }
          
      });
      this.qResp.sort((a, b) => { return b.job_id - a.job_id});
      //console.log(this.qResp);
    },
    err => {
      console.log("Fail",err);
    });
  }

  public restartJob(jobid){
    console.log("restart",jobid);
    //var email = this.storage.get('email');
    //var hash = this.storage.get('hash');
    this.apiService.restartJob(jobid,this.email,this.hash).subscribe(
    resp => {
      console.log("Success", resp);
    },
    err => {
      console.log("Fail",err);
    });
  }

  public deleteJob(jobid){
    console.log("delete",jobid);
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
    var obj = this.qResp.find(x => x.job_id == jobid);
    console.log(obj);
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
}

