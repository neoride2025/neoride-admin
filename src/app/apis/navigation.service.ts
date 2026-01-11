import { CacheService } from './../services/cache.service';
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class NavigationAPIService {

    // injectable dependencies
    private httpClient = inject(HttpClient);
    private cacheService = inject(CacheService);

    navigationUrl = '';

    constructor() {
        this.navigationUrl = environment.apiURL + 'admin/navigation';
    }

    getNavigationItems(force: boolean = false) {
        return this.cacheService.getCached('navigation', () => this.httpClient.get(this.navigationUrl, { withCredentials: true }), force);
    }

    createNavigation(payload: any) {
        return this.httpClient.post(this.navigationUrl, payload, { withCredentials: true });
    }

    updateNavigation(id: string, payload: any) {
        return this.httpClient.patch(this.navigationUrl + `/${id}`, payload, { withCredentials: true });
    }

    updateNavigationStatus(id: string, payload: any) {
        return this.httpClient.patch(this.navigationUrl + `/status/${id}`, payload, { withCredentials: true });
    }

    deleteNavigation(id: string) {
        return this.httpClient.delete(this.navigationUrl + `/${id}`, { withCredentials: true });
    }
}