import { HelperService } from '../services/helper.service';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
    providedIn: 'root'
})
export class ContactAPIService {

    config: any = {};
    authUrl = '';

    constructor(
        private helperService: HelperService,
        private httpClient: HttpClient
    ) {
        this.config = this.helperService.config;
        this.authUrl = this.config.apiURL + 'admin/';
    }

    getContacts() {
        return this.httpClient.get(this.authUrl + 'contact');
    }


}