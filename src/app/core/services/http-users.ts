import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// El servicio del frontend para hacer peticiones al backend

@Injectable({
  providedIn: 'root',
})
export class HttpUsers {
  constructor(private http: HttpClient) { }

  getAllUsers(): Observable<any> {
    return this.http.get('http://localhost:3000/api/v1/users')
  }
}
