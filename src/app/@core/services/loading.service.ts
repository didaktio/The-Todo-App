import { Injectable } from '@angular/core';
import { LoadingOptions } from '@ionic/core';
import { LoadingController } from '@ionic/angular';


@Injectable({ providedIn: 'root' })
export class LoadingService {

    private loading: HTMLIonLoadingElement;

    constructor(private loadingCtrl: LoadingController) {
        this.init();
    }

    private async init() {
        this.loading = await this.loadingCtrl.create();
    }

    /**
    Creates and presents a loading element. Defaults: classic spinner, no backdrop dismiss, overlay whole view. 
    */
    async present(options?: LoadingOptions | string) {
        if (!this.loading || options) this.loading = await this.loadingCtrl.create(typeof options === 'string' ? { id: options } : options);
        await this.loading.present();
        return this.loading;
    }

    /**
    Dismisses loading element. Will dismiss top element if no ID is passed.
    */
    async dismiss(id?: string) {
        try {
            await this.loading.dismiss(id);
            return this.init();
        } catch (e) {
            if (!e.includes(`Cannot read property 'dismiss' of undefined`)) console.error(e);
        }
    }

}