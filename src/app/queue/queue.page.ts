import { Component, OnInit } from '@angular/core';
import { APICallsService } from '../apicalls.service';

@Component({
  selector: 'app-queue',
  templateUrl: './queue.page.html',
  styleUrls: ['./queue.page.scss'],
})
export class QueuePage implements OnInit {

  constructor(private apiService:APICallsService) {  }

  ngOnInit() {
  }

}
