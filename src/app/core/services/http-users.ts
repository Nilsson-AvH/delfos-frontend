import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, of, tap } from 'rxjs';
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
  private usersSlug = environment.usersSlug;

  /**
   * Obtener todos los usuarios
   */
  getAllUsers(): Observable<any> {
    return this.http.get(`${this.apiUrl}${this.usersSlug}`)
      //Este pipe nos permite manejar la data que llega del backend
      .pipe(
        //tap nos permite ejecutar un efecto secundario, en este caso, imprimir la data en consola
        tap(data => console.log('Data', data)),
        //catchError nos permite manejar los errores que puedan ocurrir en la peticion
        catchError(error => of([]))
      );
  }

  /**
   * Obtener un usuario por ID
   */
  getUserById(userId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}${this.usersSlug}/${userId}`);
  }

  /**
   * Eliminar un usuario
   */
  deleteUserById(userId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}${this.usersSlug}/${userId}`);
  }

}