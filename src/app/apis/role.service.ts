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

    createRole(payload: any) {
        return this.httpClient.post(this.authUrl + 'create-role', payload);
    }

    updateRole(id: string, payload: any) {
        return this.httpClient.patch(this.authUrl + `roles/${id}`, payload);
    }

    getRoles() {
        return this.httpClient.get(this.authUrl + 'roles');
    }

    getPermissionsByGrouped() {
        return this.httpClient.get(this.authUrl + 'grouped-permissions');
    }

    deleteRole(id: string) {
        return this.httpClient.delete(this.authUrl + `roles/${id}`);
    }

}