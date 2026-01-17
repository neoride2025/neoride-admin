import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { CacheService } from '../services/cache.service';

@Injectable({
    providedIn: 'root'
})
export class OrgUserAPIService {

    // injectable dependencies
    private httpClient = inject(HttpClient);
    private cacheService = inject(CacheService);

    orgUserUrl = '';

    constructor() {
        this.orgUserUrl = environment.apiURL + 'admin/org-users';
    }
    getOrgUsers(force: boolean = false) {
        return this.cacheService.getCached('org-users', () => this.httpClient.get(this.orgUserUrl, { withCredentials: true }), force);
    }

    createOrgUser(payload: any) {
        return this.httpClient.post(this.orgUserUrl, payload, { withCredentials: true });
    }

    updateOrgUser(id: string, payload: any) {
        return this.httpClient.patch(this.orgUserUrl + `/${id}`, payload, { withCredentials: true });
    }

    updateOrgUserStatus(id: string, payload: any) {
        return this.httpClient.patch(this.orgUserUrl + `/status/${id}`, payload, { withCredentials: true });
    }

    deleteOrgUser(id: string) {
        return this.httpClient.delete(this.orgUserUrl + `/${id}`, { withCredentials: true });
    }
}