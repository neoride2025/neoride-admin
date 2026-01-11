import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { CacheService } from '../services/cache.service';

@Injectable({
    providedIn: 'root'
})
export class RoleAPIService {

    // injectable dependencies
    private httpClient = inject(HttpClient);
    private cacheService = inject(CacheService);

    roleUrl = '';

    constructor() {
        this.roleUrl = environment.apiURL + 'admin/roles';
    }

    getRoles(force: boolean = false) {
        return this.cacheService.getCached('roles', () => this.httpClient.get(this.roleUrl, { withCredentials: true }), force);
    }

    createRole(payload: any) {
        return this.httpClient.post(this.roleUrl, payload, { withCredentials: true });
    }

    updateRole(id: string, payload: any) {
        return this.httpClient.patch(this.roleUrl + `/${id}`, payload, { withCredentials: true });
    }

    updateRoleStatus(id: string, payload: any) {
        return this.httpClient.patch(this.roleUrl + `/status/${id}`, payload, { withCredentials: true });
    }

    deleteRole(id: string) {
        return this.httpClient.delete(this.roleUrl + `/${id}`, { withCredentials: true });
    }
}