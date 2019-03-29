import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { QueuePage } from './queue.page';
import {NgxPaginationModule} from 'ngx-pagination';

const routes: Routes = [
  {
    path: '',
    component: QueuePage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NgxPaginationModule,
    RouterModule.forChild(routes)
  ],
  declarations: [QueuePage]
})
export class QueuePageModule {}
