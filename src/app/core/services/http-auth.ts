import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { User } from '../interfaces/user';
import { BehaviorSubject, catchError, Observable, of, tap } from 'rxjs';
import { ResponseLogin } from '../interfaces/response-login';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class HttpAuth {

  // BehaviorSubject: Emite el valor actual a los suscriptores
  // Se usa para mantener el estado actual del usuario y el token
  private currentUser = new BehaviorSubject<Partial<User> | null>(null);
  private currentToken = new BehaviorSubject<string | null>(null);

  // Observable: Permite suscribirse a los cambios
  public currentUser$ = this.currentUser.asObservable();
  public currentToken$ = this.currentToken.asObservable();

  private apiUrl = environment.apiUrl;
  // private authSlug = environment.authSlug;

  constructor(
    private http: HttpClient
  ) {
    // Al iniciar el servicio, verificar si hay datos en el local storage,
    // si no hay datos, redirigir al login, si existe, mantener la sesion
    this.getLocalStorageData();
  }

  register(credentials: Partial<User>): Observable<Partial<User>> {
    return this.http.post<Partial<User>>(`${this.apiUrl}/v1/auth/register`, credentials);
  }

  login(credentials: Partial<User>): Observable<ResponseLogin> {
    return this.http.post<ResponseLogin>(`${this.apiUrl}/v1/auth/login`, credentials)
      .pipe(
        tap((data) => {
          if (data.token && data.user) {
            this.currentToken.next(data.token);
            this.currentUser.next(data.user);
          }
        })
      );
  }

  saveLocalStorage(token: string, userData: any) {
    localStorage.setItem('token', token); // Token en el storage
    localStorage.setItem('userData', JSON.stringify(userData)); // Usuario en el storage
    this.currentUser.next(userData);
    this.currentToken.next(token);
  }

  getLocalStorageData() {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('userData');
    if (token && userData) {
      this.currentUser.next(JSON.parse(userData));
      this.currentToken.next(token);
    }
    else {
      this.currentUser.next(null);
      this.currentToken.next(null);
    }
  }

  clearLocalStorageData() {
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    this.currentUser.next(null);
    this.currentToken.next(null);
  }

  logout() {
    this.clearLocalStorageData();
  }

}
