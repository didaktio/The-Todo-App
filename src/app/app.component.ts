import { Component } from '@angular/core';

import { Platform, PopoverController, ModalController } from '@ionic/angular';
import { TrashComponent } from './trash/trash.component';
import { SettingsComponent } from './settings/settings.component';
import { ThemeService } from './services/theme.service';
import { AuthService } from './services/auth.service';

import * as firebase from 'firebase/app';
import 'firebase/messaging';
import { NotificationsService } from './services/notifications.service';
import { RemindersComponent } from './reminders/reminders.component';


@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {

  constructor(
    private platform: Platform,
    private popoverCtrl: PopoverController,
    private modalCtrl: ModalController,
    public theme: ThemeService,
    public auth: AuthService,
    public notifications: NotificationsService) {

    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready();

    // TODO ERROR
    try {
      firebase.messaging().usePublicVapidKey('BML_VlYwbX9bxIy2rnkn7_7bpcBj1lKe7u_sgaEse1ub9igV_KlWHPLmRPvp8n1EKaIoaIp56JmI7GvMPEAB1EQ');
    } catch (error) {
      console.error(error);
    }

  }

  async openTrash() {
    const popover = await this.popoverCtrl.create({
      component: TrashComponent,
      cssClass: 'popover trash'
    });
    popover.present();
  }

  async openReminders() {
    const popover = await this.popoverCtrl.create({
      component: RemindersComponent,
      cssClass: 'popover reminders'
    });
    popover.present();
  }

  async openSettings() {
    const modal = await this.modalCtrl.create({
      component: SettingsComponent
    });
    modal.present();
  }


  async logout() {
    await this.auth.logout();
    window.location.reload();
  }
}
