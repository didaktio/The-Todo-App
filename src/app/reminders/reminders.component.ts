import { Component, OnInit } from '@angular/core';
import { AuthService } from '../@core/services/auth.service';
import { map } from 'rxjs/operators';
import { PopoverController } from '@ionic/angular';
import { formatDateLong } from 'utils';
import { DbService, arrayRemove } from '../@core/services/db.service';

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
    map(u => {
    if (!u || !u.reminders.length) return null;
    const reminders = u.reminders.map(reminderDate => {
      const todo = u.todos.pending.find(todo => todo.reminders.map(r => r.date).includes(reminderDate));
      const reminder = todo.reminders.filter(r => r.date === reminderDate).pop();
      return { todo, reminder };
    });
    return reminders;
  }));

  ngOnInit() { }

  delete(reminder: string) {
    this.db.updateDb({ reminders: arrayRemove(reminder) });
  }

}
