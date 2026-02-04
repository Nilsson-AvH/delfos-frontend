import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class HttpAuth {
  constructor(private http: HttpClient) { }

  register(credentials: { roleRequest: string, nuip: string, names: string, lastName: string, secondLastName: string, jobTitle: string, email: string, password: string, confirmPassword: string }) {
    return this.http.post('http://localhost:3000/api/v1/auth/register', credentials);
  }

  login(credentials: { email: string, password: string }) {
    return this.http.post('http://localhost:3000/api/v1/auth/login', credentials);
  }

}
