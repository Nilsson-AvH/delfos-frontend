import { inject, Injectable } from '@angular/core';
import { catchError, Observable, of, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { HttpAuth } from './http-auth';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class HttpClients {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;
  private clientsSlug = environment.clientsSlug;
  private httpAuth = inject(HttpAuth);
  // Crear cliente
  createClient(clientData: any): Observable<any> {
    console.log('🔴 clientData:', clientData);
    return this.http.post<any>(`${this.apiUrl}${this.clientsSlug}`, clientData, { headers: this.httpAuth.getHeader() })
      .pipe(
        tap(response => console.log('🔴 Client created successfully:', response)),
        catchError(error => {
          console.error('🔴 Error creating client:', error);
          return of(null);
        })
      );
  }
}
