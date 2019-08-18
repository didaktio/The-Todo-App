import { Component, OnInit } from '@angular/core';

import { AlertController, PopoverController } from '@ionic/angular';

import { TodoFormComponent } from './todo-form/todo-form.component';
import { HistoryComponent } from './history/history.component';
import { TodoItem, EditTodoFormData } from '../utils/models';
import { formatDateShort, formatDateLong } from '../utils/methods';
import { TodosService, SortOption, SORT_OPTIONS } from '../services/todos.service';
import { AuthService } from '../services/auth.service';
import { ActivatedRoute } from '@angular/router';
import { map, first } from 'rxjs/operators';


const FILTER_OPTIONS = [
  { label: 'Complete', key: 'complete' },
  { label: 'High Priority', key: 'highPriority' },
  { label: 'With Due Date', key: 'dateDue' },
  { label: 'Edited', key: 'lastEdited' }
] as const;
type FilterOption = typeof FILTER_OPTIONS[number];


@Component({
  templateUrl: './dash.page.html',
  styleUrls: ['./dash.page.scss'],
})
export class DashPage implements OnInit {

  constructor(
    private alertCtrl: AlertController,
    private popoverCtrl: PopoverController,
    public todos: TodosService,
    public auth: AuthService,
    private route: ActivatedRoute) { }

  formatDateShort = formatDateShort;
  formatDateLong = formatDateLong;

  sorterConfig = { header: 'Sort List' };
  sortOptions = SORT_OPTIONS;

  filterOptions = FILTER_OPTIONS;
  selectedFilterOptions: FilterOption[] = [];
  showFilterOptions = false;

  showSettingsToolbar = false;
  
  // TODO SHOW OPENING
  async ngOnInit() {
    const todoId = this.route.snapshot.queryParamMap.get('todo');
    if (todoId) {
      const item = await this.todos.items$.pipe(
        map(items => items.find(i => i.id === todoId)),
        first()).toPromise();
        this.openTodoDetails(item);
    }
  }

  async openTodoDetails(item: TodoItem) {
    const dialog = await this.alertCtrl.create({
      header: item.title,
      message: `

      ${item.notes ? `      
      <strong>Notes:</strong>
      <div>${item.notes}<div>
      <br>` : ''}

      <strong>Date Added:</strong> ${this.formatDateLong(item.dateAdded)}
      <br>

      ${item.dateDue ? `
      <strong>Date Due:</strong> ${item.dateDue.withTime ? this.formatDateLong(item.dateDue.date) : this.formatDateShort(item.dateDue.date)}
      <br>
      ` : ''}

      <strong>Priority:</strong> ${item.highPriority ? 'High' : 'Normal'}
      <br>

      ${item.lastEdited ? `
      <br>
      <div>
        <ion-note>Last Edited: ${this.formatDateShort(item.lastEdited)}</ion-note>
      <div>
      ` : ''}
      `,
      buttons: [
        {
          text: 'Close'
        }
      ],
      cssClass: `alert-todo-details${item.highPriority ? ' high-priority' : ''}${item.complete ? ' item-complete' : ''}`
    });

    if (!item.complete) dialog.buttons = [
      {
        text: 'Edit',
        handler: () => this.openTodoForm(item)
      },
      ...dialog.buttons
    ];

    if (item.history.length) dialog.buttons = [
      {
        text: 'History',
        cssClass: 'history-btn',
        handler: () => this.openHistory(item)
      },
      ...dialog.buttons
    ];

    dialog.present();
  }

  async openTodoForm(item?: TodoItem) {
    const popover = await this.popoverCtrl.create({
      component: TodoFormComponent,
      componentProps: { item },
      cssClass: 'popover todo-form'
    });
    await popover.present();

    const { data, role }: { data?: EditTodoFormData, role?: string } = await popover.onDidDismiss();

    if (role == 'cancel' || !data) return;

    // If item is available, user is EDITING todo item
    if (item) {
      const updated = {
        lastEdited: new Date().toISOString(),
        history: item.history.concat({
          ...item,
          changeMade: new Date().toISOString(),
        }),
        ...item,
        ...data
      };
      this.todos.replace(item, updated);
    }

    // Else user is ADDING new item
    else this.todos.add({
      dateAdded: new Date().toISOString(),
      history: [],
      reminders: [],
      ...data,
    });
  }

  async openHistory(item: TodoItem) {
    const popover = await this.popoverCtrl.create({
      component: HistoryComponent,
      componentProps: { item },
      cssClass: 'popover todo-history',
    });
    popover.present();
  }

  sortList(sorter: SortOption) {
    this.todos.sortItemsBy$.next(sorter);
  }

  toggleFilterOption(checked: boolean, option: FilterOption) {
    if (checked) this.selectedFilterOptions.push(option);
    else this.selectedFilterOptions = this.selectedFilterOptions.filter(o => o.label !== option.label);
  }

  shouldHide(todo: TodoItem) {
    if (!this.selectedFilterOptions.length) return false;
    for (const { key } of this.selectedFilterOptions) if (todo[key]) return false;
    return true;
  }

  delete(item: TodoItem) {
    this.todos.delete(item);
  }

}
