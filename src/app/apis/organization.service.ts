import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { CacheService } from '../services/cache.service';

@Injectable({
    providedIn: 'root'
})
export class OrganizationAPIService {

    // injectable dependencies
    private httpClient = inject(HttpClient);
    private cacheService = inject(CacheService);

    organizationUrl = '';

    constructor() {
        this.organizationUrl = environment.apiURL + 'admin/organizations';
    }
    getOrganizations(force: boolean = false) {
        return this.cacheService.getCached('organizations', () => this.httpClient.get(this.organizationUrl, { withCredentials: true }), force);
    }

    createOrganization(payload: any) {
        return this.httpClient.post(this.organizationUrl, payload, { withCredentials: true });
    }

    updateOrganization(id: string, payload: any) {
        return this.httpClient.patch(this.organizationUrl + `/${id}`, payload, { withCredentials: true });
    }

    updateOrganizationStatus(id: string, payload: any) {
        return this.httpClient.patch(this.organizationUrl + `/status/${id}`, payload, { withCredentials: true });
    }

    deleteOrganization(id: string) {
        return this.httpClient.delete(this.organizationUrl + `/${id}`, { withCredentials: true });
    }
}