import { LoginComponent } from './login/login.component';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { IonicStorageModule } from '@ionic/storage';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

import { AngularFireAuth, AngularFireAuthModule } from '@angular/fire/auth';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireModule } from '@angular/fire';
import { AngularFireMessagingModule } from '@angular/fire/messaging';

import { environment } from 'src/environments/environment';
import { TrashComponent } from './trash/trash.component';
import { SettingsComponent } from './settings/settings.component';
import { RemindersComponent } from './reminders/reminders.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SignupComponent } from './signup/signup.component';
import { DashPageModule } from './dash/dash.module';


@NgModule({
  declarations: [
    AppComponent,
    TrashComponent,
    SettingsComponent,
    RemindersComponent,
    LoginComponent,
    SignupComponent
  ],
  entryComponents: [
    TrashComponent,
    SettingsComponent,
    RemindersComponent,
    LoginComponent,
    SignupComponent
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    IonicStorageModule.forRoot(),
    AppRoutingModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFireAuthModule,
    AngularFirestoreModule,
    AngularFireMessagingModule,
    ServiceWorkerModule.register('/master-sw.js', { enabled: environment.production }),
    FormsModule,
    ReactiveFormsModule,
    DashPageModule
  ],
  providers: [
    AngularFireAuth,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }
  ],
  bootstrap: [
    AppComponent
  ]
})
export class AppModule { }
