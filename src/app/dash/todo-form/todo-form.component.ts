import { Component, OnInit, Input } from '@angular/core';
import { PopoverController, IonCheckbox } from '@ionic/angular';
import { EditTodoFormData, TodoItem } from 'src/app/utils/models';
import { FormBuilder, FormGroup } from '@angular/forms';
import { subMinutes, subHours, subDays } from 'date-fns';

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
      mins30: false,
      hours1: false,
      days1: false
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
      this.reminders.get('hours1').setValue(true);
      this.showReminders = true;
    }
    else {
      this.reminders.get('mins30').setValue(false);
      this.reminders.get('hours1').setValue(false);
      this.reminders.get('days1').setValue(false);
      this.showReminders = false;
    }
  }

  cancel() {
    this.popoverCtrl.dismiss(undefined, 'cancel');
  }


  save(formData: EditTodoFormData) {
    console.log(formData)

    // Remove empty properties
    const data = this.removeEmptyProps(formData) as EditTodoFormData;

    if (data.dateDue) {
      // If no time is set, change minutes and seconds to 0.
      if(!data.dateDue.withTime) data.dateDue.date = this.zerofyDatetime(data.dateDue.date);

      else {
        const dateDue = new Date(data.dateDue.date);
        dateDue.setSeconds(0);
        dateDue.setMilliseconds(0);
  
        const reminders = [];
        for (const key in data.reminders) if (data.reminders[key]) {
          switch (key) {
            case 'mins30': reminders.push({
              title: '30 Minute',
              date: subMinutes(dateDue, 30).toISOString()
            });
              break;
            case 'hours1': reminders.push({
              title: '1 Hour',
              date: subHours(dateDue, 1).toISOString()
            });
              break;
            case 'days1': reminders.push({
              title: '1 Day',
              date: subDays(dateDue, 1).toISOString()
            });
          }
        }
        data.reminders = reminders;
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
