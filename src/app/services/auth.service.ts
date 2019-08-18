import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { ToastController, ModalController } from '@ionic/angular';
import { tap, first, switchMap, map, shareReplay } from 'rxjs/operators';

import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';

import { TodoUser } from '../utils/models';
import { of, Observable } from 'rxjs';
import { USER_TEMPLATE } from '../utils/user-template';
import { LoginComponent } from '../login/login.component';
import { SignupComponent } from '../signup/signup.component';


@Injectable({ providedIn: 'root' })
export class AuthService {

    constructor(
        private storage: Storage,
        private modalCtrl: ModalController,
        private toastCtrl: ToastController,
        private afAuth: AngularFireAuth,
        private afs: AngularFirestore) { }

    loginWarning: HTMLIonToastElement;
    loggedIn: boolean;
    name: string;
    user$ = this.afAuth.authState.pipe(
        tap(user => {
            if (user) this.loggedIn = true;
            else this.loggedIn = false;
        }),
        switchMap(user => user ? this.afs.doc(`users/${user.uid}`).snapshotChanges().pipe(
            map(doc => doc.payload.data() as TodoUser),
            tap(user => this.name = user.general.name)
        ) : of(null)),
        shareReplay()
    ) as Observable<TodoUser>;

    get uid() {
        return this.afAuth.auth.currentUser.uid;
    }

    isLoggedIn() {
        return this.user$.pipe(first()).toPromise();
    }

    login(email: string, password: string) {
        if (this.loginWarning && this.loginWarning.present) this.loginWarning.dismiss();
        return this.afAuth.auth.signInWithEmailAndPassword(email, password);
    }

    logout() {
        return this.afAuth.auth.signOut();
    }

    async openSignup() {
        const signup = await this.modalCtrl.create({
            component: SignupComponent,
            cssClass: 'modal signup'
        });
        await signup.present();

        const { role } = await signup.onDidDismiss();
        if (role == 'skipped') this.presentSkipWarning();
        if (role == 'login') return this.openLogin();

        return true;
    }

    async openLogin() {
        const login = await this.modalCtrl.create({
            component: LoginComponent,
            cssClass: 'modal login'
        });
        await login.present();

        const { role } = await login.onDidDismiss();
        if (role == 'signup') return this.openSignup();
        else if (role == 'skipped') this.presentSkipWarning();

        return true;
    }

    private async presentSkipWarning() {
        this.loginWarning = await this.toastCtrl.create({
            header: 'By the way...',
            message: `Skipping login/signup means your data won't be saved. You also can't customise the app, set reminders or export data.`,
            showCloseButton: true,
            closeButtonText: 'Dismiss',
            color: 'danger'
        });
        this.loginWarning.present();
    }


    deleteUser() {
        return this.storage.remove('todoCredential');
    }

    async sendPasswordResetEmail() {
        const email = this.afAuth.auth.currentUser.email;
        if (!email) return console.error('No email found. If user is not logged in, an email argument must be provided.');
        try {
            await this.afAuth.auth.sendPasswordResetEmail(email);
        } catch (error) {
            return error;
        }
        return email;
    }

}
