import { Component, OnInit, Input } from '@angular/core';
import { PopoverController, IonCheckbox } from '@ionic/angular';
import { TodoItem } from 'utils';
import { FormBuilder, FormGroup } from '@angular/forms';
import { subMinutes, subHours, subDays, isFuture } from 'date-fns/esm';
import { Deadline } from 'utils/src';

export interface EditTodoFormData {
  title: string;
  notes: string;
  deadline?: Deadline;
  highPriority: boolean;
  reminders: any;
}

type Period = 'minutes' | 'hours' | 'days';
type Reminder = { title: string; date: Date };

@Component({
  selector: 'todo-form',
  templateUrl: './todo-form.component.html',
  styleUrls: ['./todo-form.component.scss'],
})
export class TodoFormComponent implements OnInit {

  constructor(
    private popoverCtrl: PopoverController,
    private fb: FormBuilder) { }

  @Input() item?: TodoItem;
  todoForm = this.fb.group({
    title: [''],
    notes: [''],
    deadline: this.fb.group({
      date: [''],
      hasTime: ['']
    }),
    highPriority: false,
    reminders: this.fb.group({
      '0_minute': false,
      '10_minute': false,
      '30_minute': false,
      '1_hour': false,
      '2_hour': false,
      '1_day': false,
      '2_day': false
    })
  });

  showReminders: boolean;

  ngOnInit() {
    if (this.item) {
      this.todoForm.patchValue(this.item);
      if (this.item.reminders.length) {
        this.reminders.patchValue(this.item.reminders.reduce((acc, cur) => ({ ...acc, [cur.title.replace(' ', '_')]: true }), {}));
        this.showReminders = true;
      }
    }
  }

  get title() {
    return this.todoForm.get('title');
  }
  get notes() {
    return this.todoForm.get('notes');
  }
  get highPriority() {
    return this.todoForm.get('highPriority');
  }
  get deadline() {
    return this.todoForm.get('deadline') as FormGroup;
  }
  get deadlineDate() {
    return this.deadline.get('date');
  }
  get hasTime() {
    return this.deadline.get('hasTime').value;
  }
  get reminders() {
    return this.todoForm.get('reminders') as FormGroup;
  }

  sendRemindersClicked(el: IonCheckbox) {
    if (el.checked) {
      this.reminders.get('0_minute').setValue(true);
      this.reminders.get('1_hour').setValue(true);
      this.showReminders = true;
    }
    else {
      this.reminders.reset();
      this.showReminders = false;
    }
  }

  cancel() {
    this.popoverCtrl.dismiss(undefined, 'cancel');
  }

  save(data: EditTodoFormData) {
    if (data.deadline) {
      // If no time is set, change minutes and seconds to 0.
      if (!data.deadline.hasTime) data.deadline.date = this.zerofyDatetime(data.deadline.date);

      else {
        const deadline = new Date(data.deadline.date);
        deadline.setSeconds(0);
        deadline.setMilliseconds(0);

        const reminders = [] as Reminder[];
        for (const key in data.reminders) if (data.reminders[key]) {
          const [amount, period] = key.split('_');
          reminders.push({
            title: `${amount} ${period}`,
            date: period === 'minute' ? subMinutes(deadline, +amount)
              : period === 'hour' ? subHours(deadline, +amount)
                : subDays(deadline, +amount)
          });
        }

        data.reminders = reminders.filter(r => isFuture(r.date)).map(({ date, title }) => ({ date: date.toISOString(), title })) as any;
      }
    }
    this.popoverCtrl.dismiss(data);
  }

  zerofyDatetime(date: string) {
    const d = new Date(date);
    d.setHours(0);
    d.setMinutes(0);
    d.setMilliseconds(0);
    return d.toISOString();
  }

  addTime(time: string) {
    const timeAsDate = new Date(time);
    const merged = new Date(this.deadlineDate.value);

    merged.setHours(timeAsDate.getHours());
    merged.setMinutes(timeAsDate.getMinutes());

    this.deadline.patchValue({
      date: merged.toISOString(),
      hasTime: true
    });
    this.todoForm.markAsDirty();
  }

  removeTime() {
    this.deadline.patchValue({
      date: this.zerofyDatetime(this.deadlineDate.value),
      hasTime: false
    });
    this.todoForm.markAsDirty();
  }

  clearDatetime() {
    this.deadline.patchValue({
      date: '',
      hasTime: ''
    });
    this.todoForm.markAsDirty();
  }

}
