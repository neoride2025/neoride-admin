import { Injectable } from '@angular/core';
import { Observable, of, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CacheService {

  private cache = new Map<string, any>();

  getCached<T>(
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

  clear(key?: string) {
    key ? this.cache.delete(key) : this.cache.clear();
  }
}
