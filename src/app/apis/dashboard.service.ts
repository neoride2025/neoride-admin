import { HelperService } from '../services/helper.service';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
    providedIn: 'root'
})
export class DashboardAPIService {

    config: any = {};
    contactUrl = '';
    accessToken = '';

    constructor(
        private helperService: HelperService,
        private httpClient: HttpClient
    ) {
        this.config = this.helperService.config;
        this.contactUrl = this.config.apiURL + 'admin/';
    }

    getContactForm() {
        return this.httpClient.get(this.contactUrl + 'contact');
    }
}