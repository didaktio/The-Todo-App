import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { TrashComponent } from '../trash/trash.component';
import { SettingsComponent } from '../settings/settings.component';
import { RemindersComponent } from '../reminders/reminders.component';
import { LoginComponent } from '../login/login.component';
import { SignupComponent } from '../signup/signup.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { FontsModule } from './fonts/fonts.module';


@NgModule({
    declarations: [
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
        CommonModule,
        IonicModule,
        FormsModule,
        ReactiveFormsModule,
        FontsModule
    ],
    exports: [
        CommonModule,
        IonicModule,
        FormsModule,
        ReactiveFormsModule,
        FontsModule
    ],
    providers: [],
})
export class CoreModule { }