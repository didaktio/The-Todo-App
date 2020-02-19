import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DashPage } from './dash.page';
import { TodoFormComponent } from './todo-form/todo-form.component';
import { HistoryComponent } from './history/history.component';
import { ItemWidgetComponent } from './history/item-widget/item-widget.component';
import { CoreModule } from '../@core/core.module';

const routes: Routes = [
  {
    path: '',
    component: DashPage
  }
];

@NgModule({
  imports: [
    CoreModule,
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
