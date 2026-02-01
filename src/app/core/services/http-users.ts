import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

// El servicio del frontend para hacer peticiones al backend

@Injectable({
  providedIn: 'root',
})
export class HttpUsers {
  // constructor(private http: HttpClient) { }

  // ✅ Forma moderna Angular 21
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl; // ✅ Usar variable de entorno

  /**
   * Obtener todos los usuarios
   */
  getAllUsers(): Observable<any> {
    return this.http.get(`${this.apiUrl}/v1/users`);
  } // ✅ CERRAR FUNCIÓN

  /**
   * Obtener un usuario por ID
   */
  getUserById(userId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/v1/users/${userId}`);
  } // ✅ CERRAR FUNCIÓN

  /**
   * Eliminar un usuario
   */
  deleteUser(userId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/v1/users/${userId}`);
  } // ✅ CERRAR FUNCIÓN

} // ✅ CERRAR CLASE