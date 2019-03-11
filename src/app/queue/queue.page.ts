import { Component, OnInit } from '@angular/core';
import { APICallsService } from '../apicalls.service';
import { Storage } from '@ionic/storage';

@Component({
  selector: 'app-queue',
  templateUrl: './queue.page.html',
  styleUrls: ['./queue.page.scss'],
})
export class QueuePage implements OnInit {

  constructor(private apiService:APICallsService, private storage: Storage) {  }

  ngOnInit() {
    this.queue();
  }

  public infoJob(jobid){
    console.log("info",jobid);
  }
  public restartJob(jobid){
    console.log("restart",jobid);
    var email = ""//this.storage.get('email');
    var hash = ""//this.storage.get('hash');
    this.apiService.queue(email,hash).subscribe(
      
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
  public queue(){
    console.log("Queue")
    var email = ""//this.storage.get('email');
    var hash = ""//this.storage.get('hash');
    this.apiService.queue(email,hash).subscribe(
      
    resp => {
      console.log("Success", resp);
    },
    err => {
      console.log("Fail",err);
    });
   
  }
}