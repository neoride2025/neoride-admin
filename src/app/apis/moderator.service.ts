import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class ModeratorAPIService {

    authUrl = '';

    constructor(
        private httpClient: HttpClient
    ) {
        this.authUrl = environment.apiURL + 'admin/';
    }

    createModerator(moderator: any) {
        return this.httpClient.post(this.authUrl + 'create-moderator', moderator);
    }

    updateModerator(moderator: any) {
        return this.httpClient.put(this.authUrl + 'update-moderator', moderator);
    }

    getModerators() {
        return this.httpClient.get(this.authUrl + 'moderators');
    }

}