import { Component, OnInit, Input } from '@angular/core';
import { PopoverController, IonCheckbox } from '@ionic/angular';
import { EditTodoFormData, TodoItem } from 'todo-utils';
import { FormBuilder, FormGroup } from '@angular/forms';
import { subMinutes, subHours, subDays, isFuture } from 'date-fns/esm';


type Period = 'minutes' | 'hours' | 'days';
type Reminder = {title: string; date: Date};

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
    dateDue: this.fb.group({
      date: [''],
      withTime: ['']
    }),
    highPriority: false,
    reminders: this.fb.group({
      minutes0: false,
      minutes10: false,
      minutes30: false,
      hours1: false,
      hours2: false,
      days1: false,
      days2: false
    })
  });

  showReminders: boolean;

  ngOnInit() {
    if (this.item) this.todoForm.patchValue(this.item);
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
  get dateDue() {
    return this.todoForm.get('dateDue') as FormGroup;
  }
  get dateDueDate() {
    return this.dateDue.get('date');
  }
  get withTime() {
    return this.dateDue.get('withTime').value;
  }
  get reminders() {
    return this.todoForm.get('reminders') as FormGroup;
  }


  sendRemindersClicked(el: IonCheckbox) {
    if (el.checked) {
      this.reminders.get('minutes0').setValue(true);
      this.reminders.get('hours1').setValue(true);
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


  save(formData: EditTodoFormData) {
    // Remove empty properties
    const data = this.removeEmptyProps(formData) as EditTodoFormData;

    if (data.dateDue) {
      // If no time is set, change minutes and seconds to 0.
      if(!data.dateDue.withTime) data.dateDue.date = this.zerofyDatetime(data.dateDue.date);

      else {
        const dateDue = new Date(data.dateDue.date);
        dateDue.setSeconds(0);
        dateDue.setMilliseconds(0);
  
        const reminders = [] as Reminder[];
        for (const key in data.reminders) if (data.reminders[key]) {
          const _ = key.split(/[0-9]/),
           period = _[0] as Period,
           amount = +_[1];

           switch (period) {
            case 'minutes': reminders.push({
              title: `${amount} ${period}`,
              date: subMinutes(dateDue, amount)
            });
              break;
            case 'hours': reminders.push({
              title: `${amount} ${period}`,
              date: subHours(dateDue, amount)
            });
              break;
            case 'days': reminders.push({
              title: `${amount} ${period}`,
              date: subDays(dateDue, amount)
            });
          }

        }
        data.reminders = reminders.filter(r => isFuture(r.date)).map(({date, title}) => ({date: date.toISOString(), title}));
      }
    } 
    this.popoverCtrl.dismiss(data);
  }

  private removeEmptyProps(obj: Object): { [key: string]: any } {
    Object.keys(obj).forEach(key => {
      if (obj[key] == '') delete obj[key];
      else if (typeof obj[key] == 'object' && !Object.values(obj[key]).filter(Boolean).length) delete obj[key];
    });
    return obj;
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
    const merged = new Date(this.dateDueDate.value);

    merged.setHours(timeAsDate.getHours());
    merged.setMinutes(timeAsDate.getMinutes());

    this.dateDue.patchValue({
      date: merged.toISOString(),
      withTime: true
    });
    this.todoForm.markAsDirty();
  }

  removeTime() {
    this.dateDue.patchValue({
      date: this.zerofyDatetime(this.dateDueDate.value),
      withTime: false
    });
    this.todoForm.markAsDirty();
  }

  clearDatetime() {
    this.dateDue.patchValue({
      date: '',
      withTime: ''
    });
    this.todoForm.markAsDirty();
  }

}
