import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ForceLoadState {

    // Moderators List update

    private _forceLoadModerators = signal<boolean>(false);

    forceLoadModerators = this._forceLoadModerators.asReadonly();

    setForceLoadModerators(data: boolean) {
        this._forceLoadModerators.set(data);
    }

    clearModeratorsForceLoad() {
        this._forceLoadModerators.set(false);
    }

    // Roles List update

    private _forceLoadRoles = signal<boolean>(false);

    forceLoadRoles = this._forceLoadRoles.asReadonly();

    setForceLoadRoles(data: boolean) {
        this._forceLoadRoles.set(data);
    }

    clearRolesForceLoad() {
        this._forceLoadRoles.set(false);
    }

    // Module List update

    private _forceLoadModules = signal<boolean>(false);

    forceLoadModules = this._forceLoadModules.asReadonly();

    setForceLoadModules(data: boolean) {
        this._forceLoadModules.set(data);
    }

    clearModulesForceLoad() {
        this._forceLoadModules.set(false);
    }

    // Permission List update

    private _forceLoadPermissions = signal<boolean>(false);

    forceLoadPermissions = this._forceLoadPermissions.asReadonly();

    setForceLoadPermissions(data: boolean) {
        this._forceLoadPermissions.set(data);
    }

    clearPermissionsForceLoad() {
        this._forceLoadPermissions.set(false);
    }


}
