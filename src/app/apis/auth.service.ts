import { HelperService } from '../services/helper.service';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class AuthAPIService {

    authUrl = '';
    accessToken: any = '';
    userPermissions: any[] = [];

    constructor(
        private helperService: HelperService,
        private httpClient: HttpClient
    ) {
        this.authUrl = environment.apiURL + 'auth/';
    }

    isAdmin() {
        const isAdmin = this.helperService.getDataFromSession('userInfo')?.role === 'ADMIN' ? true : false;
        return isAdmin;
    }

    getUserPermissions() {
        this.userPermissions = this.helperService.getDataFromSession('permissions');
        return this.userPermissions;
    }

    // token related things
    getAccessToken() {
        return this.accessToken;
    }

    refreshToken() {
        return this.httpClient.post(this.authUrl + 'refresh-token', {}, { withCredentials: true });
    }

    setAccessToken(token: string) {
        sessionStorage.setItem('accessToken', token);
        this.accessToken = token;
    }

    // auth related API's
    login(body: any) {
        return this.httpClient.post(this.authUrl + 'login', body);
    }

    logout(userId?: any) {
        // 1️⃣ Call backend logout
        this.httpClient.post(this.authUrl + 'logout', { userId }, { withCredentials: true }).subscribe({
            next: (res: any) => {
                const message = userId ? res.message : 'Session out, please login again';
                this.clearClientState(message)
            },
            error: () => this.clearClientState() // even if API fails
        });
    }

    clearClientState(logoutMessage?: string) {
        // 2️⃣ Remove access token
        this.accessToken = null;
        this.helperService.logout(logoutMessage);
    }


}