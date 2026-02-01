import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpUsers } from '../../../../core/services/http-users';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-users-list',
  imports: [AsyncPipe],
  templateUrl: './users-list.html',
  styleUrl: './users-list.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UsersList {
  // Definir el atriburo que va a recibir la data
  public users$: Observable<any[]> = new Observable<any[]>();

  constructor(private httpUsers: HttpUsers) { }

  // Ciclo de vida de componentes deAngular
  ngOnInit(): void {
    this.users$ = this.httpUsers.getAllUsers();
  }
}
