import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class PermissionAPIService {

    authUrl = '';

    constructor(
        private httpClient: HttpClient
    ) {
        this.authUrl = environment.apiURL + 'admin/';
    }

    createPermission(module: any) {
        return this.httpClient.post(this.authUrl + 'create-permission', module);
    }

    updatePermission(module: any) {
        return this.httpClient.put(this.authUrl + 'update-permission', module);
    }

    getAllPermissions() {
        return this.httpClient.get(this.authUrl + 'permissions');
    }


}