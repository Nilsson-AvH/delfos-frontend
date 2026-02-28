import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { BehaviorSubject, Observable, switchMap, combineLatest, startWith, map } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClients } from '../../../../core/services/http-clients';
import { Router } from '@angular/router';
// import { JsonPipe } from '@angular/common';

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

  // Definir el atriburo que va a recibir la data de búsqueda
  public searchControl = new FormControl('');

  //Creamos un trigger para que se actualice la vista
  private refreshTrigger$ = new BehaviorSubject<void>(undefined);

  constructor(
    private httpClients: HttpClients,
    private router: Router
  ) { }

  ngOnInit(): void {
    // 1. Obtener la lista de clientes del backend
    const clientsList$ = this.refreshTrigger$.pipe(
      switchMap(() => this.httpClients.getAllClients())
    );

    // 2. Obtener el término de búsqueda (empezando con vacío)
    const searchTerm$ = this.searchControl.valueChanges.pipe(
      startWith('')
    );

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
            ${client.clientManager}
          `);

          return searchableText.includes(searchTerm);
        });
      })
    );

    console.log(this.clients$, 'initialized with search filter');
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

