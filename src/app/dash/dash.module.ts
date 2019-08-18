import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { DashPage } from './dash.page';
import { TodoFormComponent } from './todo-form/todo-form.component';
import { HistoryComponent } from './history/history.component';
import { ItemWidgetComponent } from './history/item-widget/item-widget.component';

const routes: Routes = [
  {
    path: '',
    component: DashPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes)
  ],
  declarations: [
    DashPage,
    TodoFormComponent,
    HistoryComponent,
    ItemWidgetComponent
  ],
  entryComponents: [
    TodoFormComponent,
    HistoryComponent
  ]
})
export class DashPageModule { }
