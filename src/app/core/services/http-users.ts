import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { catchError, map, Observable, of, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User } from '../interfaces/user';
import { HttpAuth } from './http-auth';

// El servicio del frontend para hacer peticiones al backend

@Injectable({
  providedIn: 'root',
})
export class HttpUsers {
  // constructor(private http: HttpClient) { }

  // ✅ Forma moderna Angular 21
  private http = inject(HttpClient);
  // apiUrl : string = 'http://localhost:3000/api';
  private apiUrl = environment.apiUrl; // ✅ Usar variable de entorno
  // usersSlug : string = '/v1/users';
  private usersSlug = environment.usersSlug;
  // Inyectar el servicio HttpAuth para obtener el token
  private httpAuth = inject(HttpAuth);

  /**
   * Crea cualquier tipo de usuario.
   * El backend debe ser lo suficientemente inteligente para recibir 
   * el payload completo y distribuirlo a las colecciones correctas 
   * basándose en el campo 'role'.
   */
  createUser(userData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}${this.usersSlug}`, userData, { headers: this.httpAuth.getHeader() })
      .pipe(
        tap(response => console.log('🟢 User created successfully:', response)),
        catchError(error => {
          console.error('Error creating user:', error);
          return of(null);
        })
      );
  }

  //   createAdministrativeUser(administrativeUser: any): Observable<any> {
  //   return this.http.post(`${this.apiUrl}/v1/users`, administrativeUser);
  // }

  /**
   * Obtener todos los usuarios con paginación
   */
  getAllUsers(page: number = 1, limit: number = 10, search: string = ''): Observable<{ users: Partial<User>[], total: number, page: number, totalPages: number }> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString())
      .set('search', search);

    return this.http.get<{ users: Partial<User>[], total: number, page: number, totalPages: number }>(`${this.apiUrl}${this.usersSlug}`, {
      headers: this.httpAuth.getHeader(),
      params
    }).pipe(
      tap(data => console.log('Data de HttpUsers.getAllUsers() ->(http-users)', data)),
      catchError(error => {
        console.error('Error in getAllUsers', error);
        return of({ users: [], total: 0, page: 1, totalPages: 1 });
      })
    );
  }

  /**
   * Obtener usuarios por rol
   */
  getUsersByRole(role: string): Observable<Partial<User>[]> {
    return this.http.get<any>(`${this.apiUrl}${this.usersSlug}?role=${role}&limit=1000`, { headers: this.httpAuth.getHeader() })
      //Este pipe nos permite manejar la data que llega del backend
      .pipe(
        map(response => response.users ? response.users : response),
        //tap nos permite ejecutar un efecto secundario, en este caso, imprimir la data en consola
        tap(data => console.log('Data de HttpUsers.getUsersByRole() ->(http-users)', data)),
        //catchError nos permite manejar los errores que puedan ocurrir en la peticion
        catchError(error => of([]))
      );
  }

  /**
   * Eliminar un usuario por ID
   */
  deleteUserById(userId: string): Observable<Partial<User>> {
    return this.http.delete<Partial<User>>(`${this.apiUrl}${this.usersSlug}/${userId}`, { headers: this.httpAuth.getHeader() });
  }

  /**
   * Obtener un usuario por ID y transformar la respuesta
   * Respuesta original: { msg: "...", user: {...}, profile: {...} }
   * Respuesta transformada: { ...user, ...profile }
   */
  getUserById(userId: string): Observable<Partial<User> | null> {
    return this.http.get<Partial<User> | null>(`${this.apiUrl}${this.usersSlug}/${userId}`, { headers: this.httpAuth.getHeader() })
      .pipe(
        // ✅ 1. Depuración inicial (opcional)
        tap(response => console.debug('🟢 Respuesta user cruda Backend getUserById() ->(http-users.ts):', response)),

        // ✅ 2. Transformación de datos (Flattening)
        map(response => {
          // Extraemos user y profile de la respuesta
          const user = response?.user || {};
          const profile = response?.profile || {};

          // Retornamos un solo objeto plano combinado
          return {
            ...user,       // names, lastName, email, role, etc.
            ...profile,    // jobTitle, signatureUrl, etc.
            // Si hay campos con el mismo nombre, profile sobrescribe a user
          };
        }),

        // ✅ 3. Depuración final (opcional)
        tap(transformedUser => console.debug('🟢 Usuario transformado getUserById() ->(http-users.ts):', transformedUser)),

        // ✅ 4. Manejo de errores
        catchError(error => {
          console.error('Error fetching user:', error);
          return of(null); // Retornar null para validar en el componente
        })
      );
  }

  /**
   * Actualizar un usuario por ID
   */
  updateUserById(userId: string | null, updatedUserData: any): Observable<Partial<User>> {
    return this.http.patch<Partial<User>>(`${this.apiUrl}${this.usersSlug}/${userId}`, updatedUserData, { headers: this.httpAuth.getHeader() });
  }

  /**
   * Subir foto de perfil de un usuario
   */
  uploadUserPhoto(userId: string, photo: File): Observable<any> {
    const formData = new FormData();
    formData.append('userId', userId);
    formData.append('photo', photo);

    return this.http.put<any>(`${this.apiUrl}${this.usersSlug}/photo`, formData, {
      headers: this.httpAuth.getHeader()
    }).pipe(
      tap(response => console.log('🟢 Photo uploaded successfully:', response)),
      catchError(error => {
        console.error('Error uploading photo:', error);
        return of(null);
      })
    );
  }

}