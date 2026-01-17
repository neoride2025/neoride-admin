import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { CacheService } from '../services/cache.service';

@Injectable({
    providedIn: 'root'
})
export class StaffAPIService {
    
    // injectable dependencies
    private httpClient = inject(HttpClient);
    private cacheService = inject(CacheService);

    staffUrl = '';

    constructor() {
        this.staffUrl = environment.apiURL + 'admin/staffs';
    }
    getAdminStaffs(force: boolean = false) {
        return this.cacheService.getCached('staffs', () => this.httpClient.get(this.staffUrl + '/ADMIN', { withCredentials: true }), force);
    }

    getOrgUsers(force: boolean = false) {
        return this.cacheService.getCached('org-users', () => this.httpClient.get(this.staffUrl + '/ORG', { withCredentials: true }), force);
    }

    createStaff(payload: any) {
        return this.httpClient.post(this.staffUrl, payload, { withCredentials: true });
    }

    updateStaff(id: string, payload: any) {
        return this.httpClient.patch(this.staffUrl + `/${id}`, payload, { withCredentials: true });
    }

    updateStaffStatus(id: string, payload: any) {
        return this.httpClient.patch(this.staffUrl + `/status/${id}`, payload, { withCredentials: true });
    }

    deleteStaff(id: string) {
        return this.httpClient.delete(this.staffUrl + `/${id}`, { withCredentials: true });
    }
}