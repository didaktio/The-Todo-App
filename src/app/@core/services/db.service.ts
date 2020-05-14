import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AuthService } from './auth.service';

import * as firebase from 'firebase/app';
import 'firebase/firestore';


export const arrayRemove = firebase.firestore.FieldValue.arrayRemove;
export const arrayAdd = firebase.firestore.FieldValue.arrayUnion;
export const Timestamp = () => new Date().toISOString();


@Injectable({ providedIn: 'root' })
export class DbService {

    userDocPath: string;

    constructor(
        private afs: AngularFirestore,
        private auth: AuthService) {

        this.auth.user$.subscribe(user => {
            if (user) this.userDocPath = `users/${user.uid}`;
        });
    }

    updateDb(data) {
        data.lastUpdated = Timestamp();
        return this.afs.doc(this.userDocPath).set(data, { merge: true });
    }
}