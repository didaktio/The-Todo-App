import { Component, OnInit } from '@angular/core';
import { TodosService } from '../services/todos.service';
import { formatDateShort } from '../utils/methods';
import { PopoverController } from '@ionic/angular';
import { TodoItem } from '../utils/models';


@Component({
  selector: 'app-trash',
  templateUrl: './trash.component.html',
  styleUrls: ['./trash.component.scss'],
})
export class TrashComponent implements OnInit {

  constructor(
    public todos: TodosService,
    public popoverCtrl: PopoverController) { }

  formatDateShort = formatDateShort;

  ngOnInit() { }

  putBack(item: TodoItem) {
    this.todos.restoreFromTrash(item);
  }

}
