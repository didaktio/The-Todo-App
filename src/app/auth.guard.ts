import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';

import { AuthService } from './@core/services/auth.service';


@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {

  constructor(private auth: AuthService) { }

  async canActivate() {

    if (!await this.auth.isLoggedIn()) await this.auth.openLogin();

    return true;
  }
}
