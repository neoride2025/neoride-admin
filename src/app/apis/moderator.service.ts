import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { of, tap } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ModeratorAPIService {

    authUrl = '';
    private cache: any;

    constructor(
        private httpClient: HttpClient
    ) {
        this.authUrl = environment.apiURL + 'admin/';
    }

    createModerator(payload: any) {
        return this.httpClient.post(this.authUrl + 'create-moderator', payload);
    }

    updateModerator(id: string, payload: any) {
        return this.httpClient.patch(this.authUrl + `moderators/${id}`, payload);
    }

    deleteModerator(id: string) {
        return this.httpClient.delete(this.authUrl + `moderators/${id}`);
    }

    getModerators(force = false) {
        if (this.cache && !force)
            return of(this.cache);

        return this.httpClient.get(this.authUrl + 'moderators').pipe(
            tap(data => (this.cache = data))
        );
    }

}