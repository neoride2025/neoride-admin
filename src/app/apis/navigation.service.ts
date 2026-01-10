import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class NavigationAPIService {

    adminUrl = ''
    constructor(
        private httpClient: HttpClient
    ) {
        this.adminUrl = environment.apiURL + 'admin/';
    }

    getNavigationItems() {
        return this.httpClient.get(this.adminUrl + 'navigation', { withCredentials: true });
    }
}