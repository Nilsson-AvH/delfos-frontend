import { Component, ChangeDetectionStrategy } from '@angular/core';
import { BehaviorSubject, Observable, switchMap, combineLatest, startWith, map } from 'rxjs';
import { HttpUsers } from '../../../../core/services/http-users';
import { AsyncPipe } from '@angular/common';
import { Router } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
// import { JsonPipe } from '@angular/common';

@Component({
  selector: 'app-users-list',
  imports: [
    AsyncPipe,
    ReactiveFormsModule,
    // JsonPipe
  ],
  templateUrl: './users-list.html',
  styleUrl: './users-list.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export default class UsersList {
  // Definir el atriburo que va a recibir la data
  public users$: Observable<any[]> = new Observable<any[]>();
  // Definir el atriburo que va a recibir la data de búsqueda
  public searchControl = new FormControl('');

  //Creamos un trigger para que se actualice la vista
  private refreshTrigger$ = new BehaviorSubject<void>(undefined);

  constructor(
    private httpUsers: HttpUsers,
    private router: Router
  ) { }

  // Ciclo de vida de componentes deAngular
  ngOnInit(): void {
    // 1. Obtener la lista de usuarios del backend
    const usersList$ = this.refreshTrigger$.pipe(
      switchMap(() => this.httpUsers.getAllUsers())
    );

    // 2. Obtener el término de búsqueda (empezando con vacío)
    const searchTerm$ = this.searchControl.valueChanges.pipe(
      startWith('')
    );

    // 3. Combinar ambos y filtrar
    this.users$ = combineLatest([usersList$, searchTerm$]).pipe(
      map(([users, term]) => {
        // Función para normalizar texto (quitar tildes y pasar a minúsculas)
        const normalize = (str: string | null) =>
          (str || '').normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

        const searchTerm = normalize(term);

        if (!searchTerm) return users; // Si no hay búsqueda, retorna todo

        return users.filter(user => {
          // Concatenar todos los campos relevantes en una sola cadena para buscar
          const searchableText = normalize(`
            ${user.nuip} 
            ${user.names} 
            ${user.lastName} 
            ${user.secondLastName} 
            ${user.jobTitle} 
            ${user.role}
          `);

          return searchableText.includes(searchTerm);
        });
      })
    );

    console.log(this.users$, 'initialized with search filter');
  }

  onEdit(userId: string): void {
    this.httpUsers.getUserById(userId).subscribe({
      next: (data) => {
        console.log('User data de onEdit (users-list)', data);
        this.router.navigate(['/dashboard/users/edit/', userId]);
      },
      error: (error) => {
        console.error('🔴 Error obteniendo usuario', error);
      }
    });
  }

  onDelete(userId: string): void {
    this.httpUsers.deleteUserById(userId).subscribe({
      next: (data) => {
        console.log('🟢 User deleted', data);
        //Disparamos el trigger para que se actualice la vista
        this.refreshTrigger$.next();
      },
      error: (error) => {
        console.error('🔴 Error borrando usuario', error);
      }
    });
  }
}
