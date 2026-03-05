import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, of, tap } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { HttpAuth } from './http-auth';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class HttpClients {

  // ✅ Forma moderna Angular 21

  // Inject HttpClient para hacer peticiones
  private http = inject(HttpClient);
  // Inject environment para obtener variables de entorno
  private apiUrl = environment.apiUrl;
  // Inject environment para obtener variables de entorno
  private clientsSlug = environment.clientsSlug;
  // Inject HttpAuth para obtener el token
  private httpAuth = inject(HttpAuth);

  // ✅ Fin Forma moderna Angular 21

  /**
   * Crear cliente
   */
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

  /**
   * Obtener todos los clientes con paginación
   */
  getAllClients(page: number = 1, limit: number = 10, search: string = ''): Observable<{ clients: any[], total: number, page: number, totalPages: number }> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString())
      .set('search', search);

    return this.http.get<{ clients: any[], total: number, page: number, totalPages: number }>(`${this.apiUrl}${this.clientsSlug}`, {
      headers: this.httpAuth.getHeader(),
      params
    }).pipe(
      tap(response => console.log('🟢 Clients fetched successfully:', response)),
      catchError(error => {
        console.error('🔴 Error fetching clients:', error);
        return of({ clients: [], total: 0, page: 1, totalPages: 1 });
      })
    );
  }

  /**
   * Obtener un cliente por ID
   */
  getClientById(clientId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}${this.clientsSlug}/${clientId}`, { headers: this.httpAuth.getHeader() })
      .pipe(
        tap(response => console.log('🟢 Client fetched successfully:', response)),
        catchError(error => {
          console.error('🔴 Error fetching client:', error);
          return of(null);
        })
      );
  }

  /**
   * Actualizar un cliente por ID (Corporativo)
   */
  updateClientById(clientId: string, clientData: any): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}${this.clientsSlug}/${clientId}`, clientData, { headers: this.httpAuth.getHeader() })
      .pipe(
        tap(response => console.log('🟢 Client updated successfully:', response)),
        catchError(error => {
          console.error('🔴 Error updating client:', error);
          return of(null);
        })
      );
  }

  /**
   * Actualizar el manager asignado a un cliente (Historial)
   */
  updateClientManager(clientId: string, newManagerId: string): Observable<any> {
    const payload = { newManagerId, reason: "Manual assignment from Dashboard" };
    return this.http.patch<any>(`${this.apiUrl}${this.clientsSlug}/${clientId}/manager`, payload, { headers: this.httpAuth.getHeader() })
      .pipe(
        tap(response => console.log('🟢 Client manager updated successfully:', response)),
        catchError(error => {
          console.error('🔴 Error updating client manager:', error);
          return of(null);
        })
      );
  }

  /**
   * Eliminar un cliente por ID
   */
  deleteClientById(clientId: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}${this.clientsSlug}/${clientId}`, { headers: this.httpAuth.getHeader() })
      .pipe(
        tap(response => console.log('🟢 Client deleted successfully:', response)),
        catchError(error => {
          console.error('🔴 Error deleting client:', error);
          return of(null);
        })
      );
  }
}
