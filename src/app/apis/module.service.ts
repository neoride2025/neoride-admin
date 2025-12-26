import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class ModuleAPIService {

    authUrl = '';

    constructor(
        private httpClient: HttpClient
    ) {
        this.authUrl = environment.apiURL + 'admin/';
    }

    createModule(module: any) {
        return this.httpClient.post(this.authUrl + 'create-module', module);
    }

    updateModule(module: any) {
        return this.httpClient.put(this.authUrl + 'update-role', module);
    }

    getAllModules() {
        return this.httpClient.get(this.authUrl + 'modules');
    }

    getPermissionsByGrouped() {
        return this.httpClient.get(this.authUrl + 'grouped-permissions');
    }


}