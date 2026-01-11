import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { CacheService } from '../services/cache.service';

@Injectable({
    providedIn: 'root'
})
export class PermissionAPIService {

    // injectable dependencies
    private httpClient = inject(HttpClient);
    private cacheService = inject(CacheService);

    permissionUrl = '';

    constructor() {
        this.permissionUrl = environment.apiURL + 'admin/permissions';
    }

    getPermissions(force: boolean = false) {
        return this.cacheService.getCached('permissions', () => this.httpClient.get(this.permissionUrl, { withCredentials: true }), force);
    }

    createPermission(payload: any) {
        return this.httpClient.post(this.permissionUrl, payload, { withCredentials: true });
    }

    updatePermission(id: string, payload: any) {
        return this.httpClient.patch(this.permissionUrl + `/${id}`, payload, { withCredentials: true });
    }

    updatePermissionStatus(id: string, payload: any) {
        return this.httpClient.patch(this.permissionUrl + `/status/${id}`, payload, { withCredentials: true });
    }

    deletePermission(id: string) {
        return this.httpClient.delete(this.permissionUrl + `/${id}`, { withCredentials: true });
    }
}