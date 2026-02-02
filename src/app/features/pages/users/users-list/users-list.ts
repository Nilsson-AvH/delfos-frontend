import { Component, ChangeDetectionStrategy } from '@angular/core';
import { BehaviorSubject, Observable, switchMap } from 'rxjs';
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
  // users: any[] = []; // Signals

  //Creamos un trigger para que se actualice la vista
  private refreshTrigger$ = new BehaviorSubject<void>(undefined);

  constructor(private httpUsers: HttpUsers) { }

  // Ciclo de vida de componentes deAngular
  ngOnInit(): void {
    //Usamos el trigger para que se actualice la vista
    this.users$ = this.refreshTrigger$.pipe(
      switchMap(() => this.httpUsers.getAllUsers())
    );
  }

  onEdit(userId: string): void {
    this.httpUsers.getUserById(userId).subscribe({
      next: (data) => {
        console.log('User data', data);
      },
      error: (error) => {
        console.error('Error getting user data', error);
      }
    });
  }

  onDelete(userId: string): void {
    this.httpUsers.deleteUserById(userId).subscribe({
      next: (data) => {
        console.log('User deleted', data);
        //Disparamos el trigger para que se actualice la vista
        this.refreshTrigger$.next();
      },
      error: (error) => {
        console.error('Error deleting user', error);
      }
    });
  }
}
