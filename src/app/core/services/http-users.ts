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
        tap(data => console.log('Data de getAllUsers (http-users)', data)),
        //catchError nos permite manejar los errores que puedan ocurrir en la peticion
        catchError(error => of([]))
      );
  }

  /**
   * Eliminar un usuario por ID
   */
  deleteUserById(userId: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}${this.usersSlug}/${userId}`);
  }

  /**
   * Obtener un usuario por ID
   */
  getUserById(userId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}${this.usersSlug}/${userId}`)
      .pipe(
        tap(data => console.log('Data de getUserById (http-users)', data)),
        catchError(error => of([]))
        // TODO: Te encontre, perro, de aca tengo que sacar los datos del usuario y cargarlos en el formulario
        // https://github.com/BIT-202507/repaso-frontend/commit/b1d27f1408ca30400fd2813657449cae9bc8b1b8
      );
  }

  /**
   * Actualizar un usuario por ID
   */
  updateUserById(userId: string | null, updatedUserData: any): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}${this.usersSlug}/${userId}`, updatedUserData);
  }

}