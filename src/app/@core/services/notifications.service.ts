import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';

import { ToastController } from '@ionic/angular';
import { AngularFireMessaging } from '@angular/fire/messaging';
import { DbService } from './db.service';
import { Observable, of, throwError, } from 'rxjs';
import { merge, switchMap, map, share, catchError } from 'rxjs/operators';


@Injectable({ providedIn: 'root' })
export class NotificationsService {


    private warning: HTMLIonToastElement;
    private lastUsedToken: string;


    constructor(
        private auth: AuthService,
        private toastCtrl: ToastController,
        private afMessaging: AngularFireMessaging,
        private db: DbService) {

        this.auth.user$.pipe(
            switchMap(user => {
                if (!user) return of(null);
                this.lastUsedToken = user.deviceToken;
                return this.notificationPerms$
            }),
        ).subscribe(async (res: { state: string, deviceToken: string }) => {
            if (!res) return;

            let { state, deviceToken } = res;
            if (state == 'denied') this.presentNotificationsWarning(state);
            else if (state == 'prompt') this.presentNotificationsWarning(state);
            else if (state == 'granted' && this.warning && this.warning.present) {

                try {
                    deviceToken = await this.afMessaging.getToken.toPromise();
                    this.warning.dismiss();
                } catch (error) {
                    console.error(error);
                }
            }

            if (deviceToken && this.lastUsedToken !== deviceToken) {
                this.db.updateDb({ deviceToken });
                this.lastUsedToken = deviceToken;
            }

        });

    }

    // TODO ERROR
    private notificationPerms$ = new Observable(observer => {
        (window.navigator as any).permissions.query({ name: 'notifications' }).then(permission => {
            observer.next({ state: permission.state });
            permission.onchange = ev => observer.next({ state: (ev.target as any).state });
        }).catch(error => observer.error(error))
    }).pipe(
        //TODO MOVE ERROR TO INNER-MOST
        merge(this.afMessaging.tokenChanges.pipe(
            map(token => ({ deviceToken: token })),
            catchError(error => throwError({ error }))
        )),
        share()
    );

    private async presentNotificationsWarning(state) {
        if (this.warning && this.warning.present) this.warning.dismiss();

        this.warning = await this.toastCtrl.create({
            color: 'danger',
            header: 'Notifications not enabled',
            message: `Any reminders you've set will not be received.${state == 'denied' ? ` Enable via the Site Settings in your browser. In <strong>private browsing</strong>, notifications cannot be enabled.` : ''}`
        });
        const buttons = ['Dismiss'] as any[];
        if (Notification.permission == 'default') buttons.push({
            text: 'Enable',
            handler: () => Notification.requestPermission()
        });
        this.warning.buttons = buttons;
        this.warning.present();
    }

}