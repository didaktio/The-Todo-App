import { Component, OnInit } from '@angular/core';
import { AlertController, ModalController, LoadingController } from '@ionic/angular';
import { DomSanitizer } from '@angular/platform-browser';

import { ThemeService } from '../@core/services/theme.service';
import { TodosService } from '../@core/services/todos.service';
import { AuthService } from '../@core/services/auth.service';

import { first, map } from 'rxjs/operators';
import { saveAs } from 'file-saver';
import * as JSZip from 'jszip';

import { TodoItem } from 'utils';
import { USER_TEMPLATE } from '../@core/utils/user-template';
import { DbService } from '../@core/services/db.service';
import { NgForm } from '@angular/forms';


@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent implements OnInit {

  constructor(
    private alertCtrl: AlertController,
    public modalCtrl: ModalController,
    public theme: ThemeService,
    private sanitizer: DomSanitizer,
    private todos: TodosService,
    private loadingCtrl: LoadingController,
    private auth: AuthService,
    private db: DbService) { }

  dataError: string;
  data$ = this.auth.user$.pipe(
    map(user => user ? ({ ...user.general, ...user.settings }) : null));

  ngOnInit() { }

  updateReminderEmails(emails: boolean) {
    this.db.updateDb({ general: { preferences: { reminders: { emails } } } });
  }

  updateReminderNots(notifications: boolean) {
    this.db.updateDb({ general: { preferences: { reminders: { notifications } } } });
  }

  updateGeneralRes: string;
  async updateGeneral(form: NgForm) {
    await this.db.updateDb({ general: form.value });
    form.form.markAsPristine();
    this.updateGeneralRes = 'Changes Saved!';
  }

  resetPasswordRes: string;
  async resetPassword() {
    const alert = await this.alertCtrl.create({
      header: 'Reset Your Password',
      message: 'An email will be sent to the email address used for login. If this is a problem, please contact support at: contact@thetodoapp.com',
      buttons: [
        'Cancel',
        {
          text: 'Send Email',
          handler: () => {
            const email = this.auth.sendPasswordResetEmail();
            this.resetPasswordRes = `Password reset link sent to: ${email}`;
          }
        }
      ]
    });
    alert.present();
  }

  async resetApp() {
    const confirmation = await this.alertCtrl.create({
      header: 'Reset App',
      message: `
      Selecting Yes will:
      <ul>
        <li>Delete all todo items</li>
        <li>Clear trash items</li>
        <li>Restore any custom settings to their default state.</li>
      </ul>
      <h2>Are you sure?</h2>
      `,
      buttons: [{ text: 'Yes', role: 'yes' }, { text: 'No', role: 'no' }]
    });
    await confirmation.present();

    const { role } = await confirmation.onDidDismiss();

    if (role !== 'yes') return;

    await this.db.updateDb({
      todos: USER_TEMPLATE.todos,
      settings: USER_TEMPLATE.settings,
      trash: []
    });

    window.location.reload();
  }

  async exportData() {

    const alert = await this.alertCtrl.create({
      header: 'Export Your Data',
      message: `
      Your data will be compressed into a zip file. Once compression has finished you will be prompted to download.
      <br><br>
      Only checked items will be included in the data file.`,
      inputs: [
        {
          name: 'todos',
          type: 'checkbox',
          label: 'Todo Items',
          checked: true,
          value: 'todos'
        },
        {
          name: 'trash',
          type: 'checkbox',
          label: 'Deleted Items',
          value: 'trash'
        },
        {
          name: 'settings',
          type: 'checkbox',
          label: 'Settings',
          value: 'settings'
        }
      ],
      buttons: [
        {
          text: 'Download',
          handler: async (options: string[]) => {

            const data = await this.auth.user$.pipe(first()).toPromise();

            const zip = new JSZip(),
              parent = 'The Todo App';

            zip.file(`${parent}/metadata.txt`, JSON.stringify({ name: data.general.name, joined: (data.createdAt as any).toDate() }))

            if (options.includes('todos')) {
              for (const t of data.todos.completed) zip.folder(`${parent}/todos/completed`).file(`${t.title}.txt`, JSON.stringify(t));
              for (const t of data.todos.pending) zip.folder(`${parent}/todos/pending`).file(`${t.title}.txt`, JSON.stringify(t));
            }

            if (options.includes('trash')) for (const t of data.trash) zip.folder(`${parent}/trash`).file(`${t.title}.txt`, JSON.stringify(t));

            if (options.includes('settings')) {
              if (data.settings.css) zip.folder(`${parent}/settings`).file('theme.css', data.settings.css);
              if (data.settings.theme) zip.folder(`${parent}/settings`).file('theme', data.settings.theme);
            }

            const blob = await zip.generateAsync({ type: 'blob' });

            saveAs(blob, 'TodoAppData.zip');

          }
        },
        {
          text: 'Cancel',
          role: 'cancel'
        }
      ]
    });
    alert.present();
  }

  async importData(data: FileList) {
    if (!data.length) return;

    const loading = await this.loadingCtrl.create();
    await loading.present();

    const { files } = await JSZip().loadAsync(data[0]);

    const todos = {
      pending: [] as TodoItem[],
      completed: [] as TodoItem[],
    };
    const trash: TodoItem[] = [];
    let themeCss: string;

    for (const path in files) {
      if (files[path].dir) continue;

      if (path.startsWith('The Todo App/todos/pending')) await files[path].async('text').then(todoItem => todos.pending.push(JSON.parse(todoItem)));
      else if (path.startsWith('The Todo App/todos/completed')) await files[path].async('text').then(todoItem => todos.completed.push(JSON.parse(todoItem)));
      else if (path.startsWith('The Todo App/trash')) await files[path].async('text').then(trashItem => trash.push(JSON.parse(trashItem)))
      else if (path.startsWith('The Todo App/settings/theme')) await files[path].async('text').then(css => themeCss = css);
    }

    await loading.dismiss();

    if (!todos.pending.length && !todos.completed.length && !trash.length && !themeCss) {
      this.dataError = 'Imported data is invalid or contains no files to apply.';
      return false;

    }

    const alert = await this.alertCtrl.create({
      header: 'Apply Imported Data',
      message: `
      Data found:
      <ul>
       ${todos.completed.length || todos.pending.length ? `<li>Todo items (${todos.pending.length + todos.completed.length})</li>` : ''} 
       ${trash.length ? `<li>Deleted items (${trash.length})</li>` : ''} 
       ${themeCss ? `<li>Customised theme</li>` : ''} 
      </ul>
      <h3>Apply data?</h3>
      `,
      inputs: [
        {
          label: 'Overwrite current?',
          type: 'checkbox',
          name: 'merge',
          value: 'overwrite'
        }
      ],
      buttons: [
        'No',
        {
          text: 'Yes',
          handler: (options: string[]) => {

            const overwrite = options.includes('overwrite');
            const extras = { merge: overwrite ? false : true }

            if (todos.pending.length || todos.completed.length) this.todos.setTodos(todos, extras);
            if (trash.length) this.todos.setTrash(trash, extras);
            if (themeCss) this.theme.setThemeWithCSS(themeCss);
          }
        }
      ]
    });
    alert.present();
  }
}


