import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { BehaviorSubject, Observable, switchMap, combineLatest, startWith, map } from 'rxjs';
import { AsyncPipe } from '@angular/common';
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
  public clientToDeleteId: string | null = null; // ID del cliente temporalmente seleccionado para borrar

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
      map((clients: any[]) => {
        if (!clients || clients.length === 0) return [];

        return clients.map(client => {
          let clientManagerName = 'Sin Asignar';

          // El backend ahora devuelve: client.clientManager.user = { names, lastName, ... }
          const userNode = client.clientManager?.user;

          if (userNode) {
            if (userNode.names) {
              clientManagerName = `${userNode.names} ${userNode.lastName || ''} ${userNode.secondLastName || ''}`.trim();
            } else if (userNode.fullName) {
              clientManagerName = userNode.fullName.trim();
            } else {
              clientManagerName = 'Desconocido'
            }
          }

          return {
            ...client,
            clientManagerName
          };
        });
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
          (str || '').normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

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

  goNewClient() {
    this.router.navigate(['/dashboard/clients/new']);
  }

  onEdit(clientId: string): void {
    this.httpClients.getClientById(clientId).subscribe({
      next: (data) => {
        console.log('User data de onEdit (users-list)', data);
        this.router.navigate(['/dashboard/clients/edit/', clientId]);
      },
      error: (error) => {
        console.error('🔴 Error obteniendo usuario', error);
      }
    });
  }

  onDelete(clientId: string): void {
    // En lugar de usar window.confirm, activamos el modal
    this.clientToDeleteId = clientId;
  }

  confirmDelete(): void {
    if (this.clientToDeleteId) {
      this.httpClients.deleteClientById(this.clientToDeleteId).subscribe({
        next: (data) => {
          console.log('🟢 Client deleted', data);
          this.refreshTrigger$.next();
          this.closeDeleteModal();
        },
        error: (error) => {
          console.error('🔴 Error borrando cliente', error);
          this.closeDeleteModal();
        }
      });
    }
  }

  closeDeleteModal(): void {
    this.clientToDeleteId = null;
  }

}

