import { AngularFireAuth } from '@angular/fire/auth';
import { Component, OnInit } from '@angular/core';
import { AlertController, ModalController, LoadingController } from '@ionic/angular';
import { AlertOptions } from '@ionic/core';
import { FormBuilder, Validators } from '@angular/forms';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {

  constructor(
    private alertCtrl: AlertController,
    private fb: FormBuilder,
    public modalCtrl: ModalController,
    private loadingCtrl: LoadingController,
    private afAuth: AngularFireAuth) { }

  form = this.fb.group({
    email: ['', [Validators.required]],
    password: ['', [Validators.required]]
  });
  error: string;
  showPassword = false;
  failures = 0;

  ngOnInit() { }

  get email() {
    return this.form.get('email');
  }
  get password() {
    return this.form.get('password');
  }

  login({email, password}) {
    return this.afAuth.auth.signInWithEmailAndPassword(email, password);
  }

  async submit({ email, password }) {
    if(this.form.invalid) return this.error = 'Something is wrong. Please try re-typing your details.';

  
    const loading = await this.loadingCtrl.create();
    loading.present();

    try {
      await this.login({email, password});
      this.modalCtrl.dismiss(undefined, 'success');

    } catch (error) {
      this.failures++;
      switch (error.code) {
        case 'invalid-email': this.error = 'The submitted email is invalid.';
          break;
        case 'auth/user-not-found': case 'auth/wrong-password': this.error = 'Login details not recognised.';
          break;
        default: this.error = `An error has occurred.
          The cause could be rebellious monkeys.
          Try: 
          <ul>        
          <li>trying again</li>
          <li>refreshing the page</li>
          <li>resetting your password</li>
          <li>contacting support at: contact@thetodoapp.com</li>
          </ul>`;
          console.error(error);
      }
    }
    loading.dismiss();
  }

  async resetPassword(options?: AlertOptions) {
    const alert = await this.alertCtrl.create({
      header: 'Reset Your Password',
      message: 'A reset link will be sent to the email address you use for login. If you have forgotten this, please contact us at: contact@thetodoapp.com',
      inputs: [
        {
          type: 'email',
          name: 'email',
          placeholder: 'Email'
        }
      ],
      buttons: [
        'Cancel',
        {
          text: 'Send Email',
          handler: async ({ email }) => {

            let header = 'Reset Link Sent',
              message = `Please check your email inbox and follow the link. If you no longer need or don't use the link, it will expire in due course and your password will remain unchanged.`,
              error = false;

            try {
              await this.afAuth.auth.sendPasswordResetEmail(email);

            } catch ({ code }) {
              error = true;
              switch (code) {
                case 'invalid-email':
                case 'auth/user-not-found':
                  message = '<span style="color:red">Email invalid or not recognised. Please double-check the email you entered and try again.</span>';
                  break;
                default: message = '<span style="color:red">An error has occurred. Please try again. If the problem persists, contact support at: contact@thetodoapp.com</span>'
              }
            }

            if (error) return this.resetPassword({ message });

            const result = await this.alertCtrl.create({ header, message, buttons: ['Close'] });
            result.present();
          }
        }
      ],
      ...options
    });
    alert.present();
  }

}
