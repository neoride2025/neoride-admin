import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class PermissionAPIService {

    adminUrl = ''
    constructor(
        private httpClient: HttpClient
    ) {
        this.adminUrl = environment.apiURL + 'admin/';
    }

    getPermissions() {
        return this.httpClient.get(this.adminUrl + 'permissions', { withCredentials: true });
    }

    createPermission(payload: any) {
        return this.httpClient.post(this.adminUrl + 'permissions', payload, { withCredentials: true });
    }

    updatePermission(id: string, payload: any) {
        return this.httpClient.patch(this.adminUrl + `permissions/${id}`, payload, { withCredentials: true });
    }

    updatePermissionStatus(id: string, payload: any) {
        return this.httpClient.patch(this.adminUrl + `permission-status/${id}`, payload, { withCredentials: true });
    }

    deletePermission(id: string) {
        return this.httpClient.delete(this.adminUrl + `permissions/${id}`, { withCredentials: true });
    }
}