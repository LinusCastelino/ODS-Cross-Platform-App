import { Component, OnInit } from '@angular/core';
import { APICallsService } from '../apicalls.service';
import { Storage } from '@ionic/storage';
import { ModalService } from './modal.service';

@Component({
  selector: 'app-queue',
  templateUrl: './queue.page.html',
  styleUrls: ['./queue.page.scss'],

})
export class QueuePage implements OnInit {

  private bodyText: string;


  constructor(private apiService:APICallsService, private storage: Storage, private modalService: ModalService) {
  }

  ngOnInit() {
    this.queue();
    this.bodyText = 'This text can be updated in modal 1';
  }

  openModal(id: string) {
    this.modalService.open(id);
}

closeModal(id: string) {
    this.modalService.close(id);
}


  public infoJob(jobid){
    console.log("info",jobid);
    this.openModal("bdashfbskhflh dli");
  }
  public restartJob(jobid){
    console.log("restart",jobid);
    var email = ""//this.storage.get('email');
    var hash = ""//this.storage.get('hash');
    this.apiService.restartJob(jobid,email,hash).subscribe(
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