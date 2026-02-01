import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// El servicio del frontend para hacer peticiones al backend

@Injectable({
  providedIn: 'root',
})
export class HttpAdministrativeUsers {
  constructor(private http: HttpClient) { }

  createAdministrativeUser(administrativeUser: any) {
    //Aca despues tenemos que agregar los token para enviarselos al http y haga la ligica segun el backend
    return this.http.post('http://localhost:3000/api/v1/users', administrativeUser)
  }
}