import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class AdminAPIService {

    adminUrl = ''
    constructor(
        private httpClient: HttpClient
    ) {
        this.adminUrl = environment.apiURL + 'staff/';
    }

    // for menu render purpose
    getNavigationMenuItems() {
        return this.httpClient.get(this.adminUrl + 'menu-navigation', { withCredentials: true });
    }
}