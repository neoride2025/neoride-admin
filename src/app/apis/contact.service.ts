import { HelperService } from '../services/helper.service';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class ContactAPIService {

    authUrl = '';

    constructor(
        private httpClient: HttpClient
    ) {
        this.authUrl = environment.apiURL + 'admin/';
    }

    getContacts() {
        return this.httpClient.get(this.authUrl + 'contact');
    }


}