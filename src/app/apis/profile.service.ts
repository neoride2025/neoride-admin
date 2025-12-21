import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class ProfileAPIService {

    adminUrl = '';

    constructor(
        private httpClient: HttpClient
    ) {
        this.adminUrl = environment.apiURL + 'admin/';
    }

    getProfileDetails() {
        return this.httpClient.post(this.adminUrl + 'me', {});
    }


}