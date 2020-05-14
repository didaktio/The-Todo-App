import { Component, OnInit } from '@angular/core';
import { AuthService } from '../@core/services/auth.service';
import { switchMap } from 'rxjs/operators';
import { PopoverController } from '@ionic/angular';
import { formatDateLong, TodoItem } from 'utils';
import { DbService, arrayRemove } from '../@core/services/db.service';
import { isFuture } from 'date-fns/esm';

@Component({
  selector: 'app-reminders',
  templateUrl: './reminders.component.html',
  styleUrls: ['./reminders.component.scss'],
})
export class RemindersComponent implements OnInit {

  toDate = formatDateLong;

  constructor(
    public popoverCtrl: PopoverController,
    private auth: AuthService,
    private db: DbService) { }

  reminders$ = this.auth.user$.pipe(
    switchMap(async ({ reminders, todos }) => {
      if (!reminders.length) return null;

      const list: { todo: TodoItem, reminder: { title: string; date: string; } }[] = [];
      for (const date of reminders) {

        // Delete redundant reminders if found.
        if (!isFuture(new Date(date))) await this.db.updateDb({ reminders: arrayRemove(date) });

        else {
          const todo = todos.pending.find(t => t.reminders.findIndex(x => x.date === date) !== -1),
            reminder = todo.reminders.filter(r => r.date === date).pop();
          list.push({ todo, reminder });
        }
      }

      return list;
    }));

  ngOnInit() { }

  delete(reminder: string) {
    this.db.updateDb({ reminders: arrayRemove(reminder) });
  }

}
