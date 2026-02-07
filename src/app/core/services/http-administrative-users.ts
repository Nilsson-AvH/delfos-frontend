import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

// El servicio del frontend para hacer peticiones al backend

@Injectable({
  providedIn: 'root',
})
export class HttpAdministrativeUsers {
  // constructor(private http: HttpClient) { }

  // Forma moderna Angular 21
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl; // Usar variable de entorno

  /**
   * Crear nuevo usuario administrativo
   * El interceptor dev-bypass inyecta automáticamente el header X-Token-Dev
   */
  createAdministrativeUser(administrativeUser: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/v1/users`, administrativeUser);
  }

  /**
   * Obtener todos los usuarios administrativos
   */
  // getAdministrativeUsers(): Observable<any> {
  //   return this.http.get(`${this.apiUrl}/v1/users`);
  // }

  /**
   * Actualizar usuario administrativo
   */
  // updateAdministrativeUser(userId: string, userData: any): Observable<any> {
  //   return this.http.patch(`${this.apiUrl}/v1/users/${userId}`, userData);
  // }

  /**
   * Eliminar usuario administrativo
   */
  // deleteAdministrativeUser(userId: string): Observable<any> {
  //   return this.http.delete(`${this.apiUrl}/v1/users/${userId}`);
  // }

}