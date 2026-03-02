import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { BehaviorSubject, Observable, switchMap, combineLatest, startWith, map, forkJoin, of, catchError, tap } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClients } from '../../../../core/services/http-clients';
import { Router } from '@angular/router';
import { HttpUsers } from '../../../../core/services/http-users';
// import { JsonPipe } from '@angular/common';
// import { User } from '../../../../core/interfaces/user';

@Component({
  selector: 'app-client-list',
  imports: [
    AsyncPipe,
    ReactiveFormsModule,
    // JsonPipe
  ],
  templateUrl: './client-list.html',
  styleUrl: './client-list.css',
})
export default class ClientList {
  // Definir el atriburo que va a recibir la data
  public clients$: Observable<any[]> = new Observable<any[]>();

  // Definir el atriburo que va a recibir la data del cliente manager
  // public clientManagerName$: Observable<Partial<User>[]> = new Observable<Partial<User>[]>();

  // Definir el atriburo que va a recibir la data de búsqueda
  public searchControl = new FormControl('');

  //Creamos un trigger para que se actualice la vista
  private refreshTrigger$ = new BehaviorSubject<void>(undefined);

  constructor(
    private httpClients: HttpClients,
    private httpUsers: HttpUsers,
    private router: Router
  ) { }

  ngOnInit(): void {
    // 1. Obtener la lista de clientes del backend y enriquecerla con el nombre del manager
    const clientsList$ = this.refreshTrigger$.pipe(
      switchMap(() => this.httpClients.getAllClients()),
      switchMap((clients: any[]) => {
        if (!clients || clients.length === 0) return of([]);

        // Para cada cliente, hacemos una llamada a getUserById para obtener los datos del manager
        const clientsWithManagers$ = clients.map(client => {
          // Extraer el ID teniendo en cuenta que el backend ahora anida el ID del usuario real en 'clientManager.user'
          // Si por alguna razón histórica no viene 'user', intentamos sacar '_id' (aunque arroje 404).
          const managerId = client.clientManager?.user
            || client.clientManager?._id
            || client.clientManager?.id
            || (typeof client.clientManager === 'string' ? client.clientManager : null);

          // // LOGS PARA DEPURACIÓN (eliminar cuando se verifique que funciona)
          // console.log('🕵️‍♂️ Client Manager original:', client.clientManager);
          // console.log('🕵️‍♂️ ID extraído para consultar:', managerId);

          if (!managerId) {
            return of({ ...client, clientManagerName: 'Sin Asignar' });
          }

          return this.httpUsers.getUserById(managerId).pipe(
            tap(user => console.log('User data de onEdit (users-list)', user)),
            map((user: any) => {
              // Validar si trae explícitamente el fullName del backend, si no, intentarlo armar de nuevo
              let fullName = 'Desconocido';
              if (user) {
                // Guiados por el componente users-list que si funciona, los datos vienen en 'names' y 'lastName'
                if (user.fullName) {
                  fullName = `${user.fullName || ''}`.trim();
                } else if (user.names) {
                  fullName = `${user.names} ${user.lastName || ''} ${user.secondLastName || ''}`.trim();
                }
              }
              // Retornar un nuevo objeto cliente que añade la propiedad clientManagerName
              return { ...client, clientManagerName: fullName };
            }),
            catchError(() => of({ ...client, clientManagerName: 'Desconocido' }))
          );
        });

        // Esperar a que se completen todas las llamadas a getUserById
        return forkJoin(clientsWithManagers$);
      })
    );

    // 2. Obtener el término de búsqueda (empezando con vacío)
    const searchTerm$ = this.searchControl.valueChanges.pipe(
      startWith('')
    );

    // 2.5 Obtener el nombre del cliente manager
    // this.clientManagerName$ = this.clients$.pipe(
    //   switchMap((clients) => {
    //     if (!clients || clients.length === 0) return of([]);
    //     return forkJoin(
    //       clients.map(client => this.httpUsers.getUserById(client.clientManager))
    //     );
    //   }),
    //   map((managers) => managers.filter((m): m is Partial<User> => m !== null))
    // );

    // console.log('clientManagerName$', this.clients$.pipe(map(client => client.clientManager._id)));

    // 3. Combinar ambos y filtrar
    this.clients$ = combineLatest([clientsList$, searchTerm$]).pipe(
      map(([clients, term]) => {
        // Función para normalizar texto (quitar tildes y pasar a minúsculas)
        const normalize = (str: string | null) =>
          (str || '').normalize("NFD").replace(/[^\u0300-\u036f]/g, "").toLowerCase();

        const searchTerm = normalize(term);

        if (!searchTerm) return clients; // Si no hay búsqueda, retorna todo

        return clients.filter(client => {
          // Concatenar todos los campos relevantes en una sola cadena para buscar
          const searchableText = normalize(`
            ${client.companyName}
            ${client.address}
            ${client.phone}
            ${client.companyEmail}
            ${client.clientManagerName || ''}
            `);
          return searchableText.includes(searchTerm);
        });
      })
    )
    console.log('clients$', this.clients$);

    // const IdClientManager: any = this.clients$.pipe(
    //   switchMap((clients) => clients.map(client => client.clientManager))
    // );
    // this.httpUsers.getUserById(IdClientManager)
  }

  onEdit(clientId: string): void {
    this.httpClients.getClientById(clientId).subscribe({
      next: (data) => {
        console.log('User data de onEdit (users-list)', data);
        this.router.navigate(['/dashboard/users/edit/', clientId]);
      },
      error: (error) => {
        console.error('🔴 Error obteniendo usuario', error);
      }
    });
  }

  onDelete(clientId: string): void {
    this.httpClients.deleteClientById(clientId).subscribe({
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

