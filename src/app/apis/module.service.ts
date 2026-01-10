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

    createModule(payload: any) {
        return this.httpClient.post(this.authUrl + 'create-module', payload);
    }

    updateModule(id: string, payload: any) {
        return this.httpClient.patch(this.authUrl + `modules/${id}`, payload);
    }

    getAllModules() {
        return this.httpClient.get(this.authUrl + 'modules');
    }

    getPermissionsByGrouped() {
        return this.httpClient.get(this.authUrl + 'grouped-permissions');
    }

    deleteModule(id: string) {
        return this.httpClient.delete(this.authUrl + `modules/${id}`);
    }

    // Module Type related
    createModuleType(payload: any) {
        return this.httpClient.post(this.authUrl + 'create-module-type', payload);
    }

    updateModuleType(id: string, payload: any) {
        return this.httpClient.patch(this.authUrl + `module-types/${id}`, payload);
    }

    getAllModuleTypes() {
        return this.httpClient.get(this.authUrl + 'module-types');
    }

}