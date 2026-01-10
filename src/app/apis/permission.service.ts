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

    createPermission(payload: any) {
        return this.httpClient.post(this.authUrl + 'create-permission', payload);
    }

    updatePermission(id: string, payload: any) {
        return this.httpClient.patch(this.authUrl + `permissions/${id}`, payload);
    }

    getAllPermissions() {
        return this.httpClient.get(this.authUrl + 'permissions');
    }


}