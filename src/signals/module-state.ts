import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ModuleState {
  private _module = signal<any[]>([]);

  module = this._module.asReadonly();

  setModule(data: any) {
    this._module.set(data);
  }

  clear() {
    this._module.set([]);
  }
}
