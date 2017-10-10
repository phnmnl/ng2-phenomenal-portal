import { Injectable } from '@angular/core';
import { JwtToken } from 'ng2-cloud-portal-service-lib';

@Injectable()
export class PhenomenalTokenService {

  constructor() {
  }

  public setToken(token: JwtToken) {
    localStorage.setItem('ph-token', token.token);
  }

  public getToken(): JwtToken {
    if (!localStorage.getItem('ph-token')) {
      return null;
    } else {
      return <JwtToken>{
        'token': localStorage.getItem('ph-token')
      };
    }
  }

  public clearToken() {
    localStorage.removeItem('ph-token');
  }

}
