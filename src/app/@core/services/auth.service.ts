import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { ToastController, ModalController } from '@ionic/angular';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';

import { of, Observable } from 'rxjs';
import { tap, first, switchMap, map, shareReplay } from 'rxjs/operators';

import { LoginComponent } from '../../login/login.component';
import { SignupComponent } from '../../signup/signup.component';
import { TodoUser } from 'todo-utils';


@Injectable({ providedIn: 'root' })
export class AuthService {

    constructor(
        private storage: Storage,
        private modalCtrl: ModalController,
        private toastCtrl: ToastController,
        private afAuth: AngularFireAuth,
        private afs: AngularFirestore) { }

    private skipWarning: HTMLIonToastElement;
    private signupModal: HTMLIonModalElement;
    private loginModal: HTMLIonModalElement;

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
        return this.afAuth.auth.signInWithEmailAndPassword(email, password);
    }

    logout() {
        return this.afAuth.auth.signOut();
    }

    async openSignup() {
        if (this.signupModal) return; // Prevent duplicate
        if (this.skipWarning) this.dismissSkipWarning();

        this.signupModal = await this.modalCtrl.create({
            component: SignupComponent,
            cssClass: 'modal signup',
            backdropDismiss: false
        });
        await this.signupModal.present();

        const { role } = await this.signupModal.onDidDismiss();
        this.signupModal = null;

        if (role == 'skipped') this.presentSkipWarning();
        if (role == 'login') return this.openLogin();

        return true;
    }

    async openLogin() {
        if (this.loginModal) return; // Prevent duplicate
        if (this.skipWarning) this.dismissSkipWarning();

        this.loginModal = await this.modalCtrl.create({
            component: LoginComponent,
            cssClass: 'modal login',
            backdropDismiss: false
        });
        await this.loginModal.present();

        const { role } = await this.loginModal.onDidDismiss();
        this.loginModal = null;

        if (role == 'signup') return this.openSignup();
        else if (role == 'skipped') this.presentSkipWarning();

        return true;
    }

    private dismissSkipWarning() {
        if(this.skipWarning) this.skipWarning.dismiss();
    }

    private async presentSkipWarning() {
        if (this.skipWarning) return; // Prevent duplicate

        this.skipWarning = await this.toastCtrl.create({
            header: 'By the way...',
            message: `Skipping login/signup means your data won't be saved. You also can't customise the app, set reminders or export data.`,
            showCloseButton: true,
            closeButtonText: 'Dismiss',
            color: 'danger'
        });
        await this.skipWarning.present();

        await this.skipWarning.onDidDismiss();
        this.skipWarning = null;
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
