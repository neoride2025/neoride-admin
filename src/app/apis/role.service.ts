import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class RoleAPIService {

    authUrl = '';

    constructor(
        private httpClient: HttpClient
    ) {
        this.authUrl = environment.apiURL + 'admin/';
    }

    createRole(role: any) {
        return this.httpClient.post(this.authUrl + 'create-role', role);
    }

    updateRole(role: any) {
        return this.httpClient.put(this.authUrl + 'update-role', role);
    }

    getRoles() {
        return this.httpClient.get(this.authUrl + 'roles');
    }

    getPermissionsByGrouped() {
        return this.httpClient.get(this.authUrl + 'grouped-permissions');
    }


}