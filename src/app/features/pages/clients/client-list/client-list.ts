import { Component, ChangeDetectionStrategy, ViewChild, ElementRef, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { BehaviorSubject, combineLatest, map, Observable, startWith, switchMap, tap } from 'rxjs';
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
    ReactiveFormsModule
    // JsonPipe
  ],
  templateUrl: './client-list.html',
  styleUrl: './client-list.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ClientList {
  // Definir el atriburo que va a recibir la data
  public clients$: Observable<any[]> = new Observable<any[]>();

  // Definir el atriburo que va a recibir la data del cliente manager
  // public clientManagerName$: Observable<Partial<User>[]> = new Observable<Partial<User>[]>();

  // Definir el atriburo que va a recibir la data de búsqueda
  public searchControl = new FormControl('');
  @ViewChild('deleteConfirmDialog') deleteConfirmDialog!: ElementRef<HTMLDialogElement>;
  public clientIdToDelete: string | null = null;
  public selectedClientName: string = '';

  public currentPage$ = new BehaviorSubject<number>(1);
  public pageSize = 10;
  public totalPages = signal<number>(1);

  // Observable que emitirá cada vez que necesitemos recargar la lista
  // Empezamos con un valor indefinido para disparar la primera carga
  public refreshTrigger$ = new BehaviorSubject<void>(undefined);

  constructor(
    private httpClients: HttpClients,
    private httpUsers: HttpUsers,
    private router: Router
  ) { }

  ngOnInit(): void {
    const searchTerm$ = this.searchControl.valueChanges.pipe(
      startWith(''),
      tap(() => {
        if (this.currentPage$.value !== 1) {
          this.currentPage$.next(1);
        }
      })
    );

    this.clients$ = combineLatest([this.refreshTrigger$.pipe(startWith(undefined)), searchTerm$, this.currentPage$]).pipe(
      switchMap(([_, term, page]) => {
        const normalize = (str: string | null) =>
          (str || '').normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

        const searchTerm = normalize(term);

        return this.httpClients.getAllClients(page, this.pageSize, searchTerm).pipe(
          tap(res => {
            this.totalPages.set(res.totalPages);
          }),
          map(res => res.clients)
        );
      })
    );

    console.log('Clients initialized with server-side pagination');
  }

  goNewClient() {
    this.router.navigate(['/dashboard/clients/new']);
  }

  firstPage() {
    this.currentPage$.next(1);
  }

  nextPage() {
    if (this.currentPage$.value < this.totalPages()) {
      this.currentPage$.next(this.currentPage$.value + 1);
    }
  }

  prevPage() {
    if (this.currentPage$.value > 1) {
      this.currentPage$.next(this.currentPage$.value - 1);
    }
  }

  lastPage() {
    this.currentPage$.next(this.totalPages());
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
    this.clientIdToDelete = clientId;
  }

  confirmDelete(): void {
    if (this.clientIdToDelete) {
      this.httpClients.deleteClientById(this.clientIdToDelete).subscribe({
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
    this.clientIdToDelete = null;
  }

}
