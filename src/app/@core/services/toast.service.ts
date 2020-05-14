import { Injectable } from '@angular/core';
import { ToastOptions } from '@ionic/core';
import { ToastController } from '@ionic/angular';

type Options = ToastOptions | string;

@Injectable({ providedIn: 'root' })
export class ToastService {

    private toast: HTMLIonToastElement;
    private defaultOpts: ToastOptions = { duration: 3000, position: 'bottom' };
    private isPresent: boolean;

    constructor(private toastCtrl: ToastController) {
        this.init();
    }

    private async init() {
        this.toast = await this.toastCtrl.create();
    }

    async present(options?: Options) {
        if (this.isPresent) await this.toast.onDidDismiss();
        if (!this.toast || options) this.toast = await this.toastCtrl.create(typeof options === 'string' ? { ...this.defaultOpts, message: options, } : { ...this.defaultOpts, ...options });
        await this.toast.present();
        this.isPresent = true;
        this.toast.onDidDismiss().then(() => this.isPresent = false);
        return this.toast;
    }

    changesSaved() {
        this.present({ message: 'Changes saved' });
    }

    error(options?: Options) {
        if(options && typeof options === 'string'){
            this.present({
                header: 'Oh no!',
                color: 'danger',
                message: options,
                buttons: ['Close']
            });
        }
        else this.present({
            header: 'Oh no!',
            color: 'danger',
            message: 'Something went wrong - check the logs.',
            buttons: ['Close'],
            ...options as any
        });
    }

    async dismiss(id?: string) {
        await this.toast.dismiss(id);
        return this.init();
    }

}