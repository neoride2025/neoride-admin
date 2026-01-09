import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class UserState {
  private _user = signal<any>(null);

  user = this._user.asReadonly();

  setUser(data: any) {
    this._user.set(data);
  }

  clear() {
    this._user.set(null);
  }
}
