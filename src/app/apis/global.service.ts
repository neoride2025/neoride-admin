import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, of, tap } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class GlobalAPIService {

    authUrl = '';
    private cache = new Map<string, any>();

    constructor(
        private httpClient: HttpClient
    ) {
        this.authUrl = environment.apiURL + 'admin/';
    }

    getModeratorsComponentData(force: boolean) {
        return this.getCached('moderators', () => this.httpClient.get(this.authUrl + 'moderators/bootstrap'), force);
    }

    getRolesComponentData(force: boolean) {
        return this.getCached('roles', () => this.httpClient.get(this.authUrl + 'roles/bootstrap'), force);
    }

    getModulesComponentData(force: boolean) {
        return this.getCached('modules', () => this.httpClient.get(this.authUrl + 'modules/bootstrap'), force);
    }

    getPermissionsComponentData(force: boolean) {
        return this.getCached('permissions', () => this.httpClient.get(this.authUrl + 'permissions/bootstrap'), force);
    }

    // common cache function
    private getCached<T>(
        key: string,
        apiCall: () => Observable<T>,
        force = false
    ): Observable<T> {
        if (this.cache.has(key) && !force) {
            return of(this.cache.get(key));
        }

        return apiCall().pipe(
            tap(data => this.cache.set(key, data))
        );
    }

}