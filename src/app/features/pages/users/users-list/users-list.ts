import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { BehaviorSubject, Observable, switchMap, combineLatest, startWith, map, tap } from 'rxjs';
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
  public userIdToDelete: string | null = null; // ID del usuario temporalmente seleccionado para borrar

  public currentPage$ = new BehaviorSubject<number>(1);
  public pageSize = 10;
  public totalPages = signal<number>(1);

  //Creamos un trigger para que se actualice la vista
  private refreshTrigger$ = new BehaviorSubject<void>(undefined);

  constructor(
    private httpUsers: HttpUsers,
    private router: Router
  ) { }

  // Ciclo de vida de componentes deAngular
  ngOnInit(): void {
    const searchTerm$ = this.searchControl.valueChanges.pipe(
      startWith(''),
      tap(() => {
        if (this.currentPage$.value !== 1) {
          this.currentPage$.next(1);
        }
      })
    );

    this.users$ = combineLatest([this.refreshTrigger$.pipe(startWith(undefined)), searchTerm$, this.currentPage$]).pipe(
      switchMap(([_, term, page]) => {
        const normalize = (str: string | null) =>
          (str || '').normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

        const searchTerm = normalize(term);

        return this.httpUsers.getAllUsers(page, this.pageSize, searchTerm).pipe(
          tap(res => {
            this.totalPages.set(res.totalPages);
          }),
          map(res => res.users)
        );
      })
    );

    console.log('Users initialized with server-side pagination');
  }

  goNewUser() {
    this.router.navigate(['/dashboard/users/new']);
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
    // En lugar de usar window.confirm, activamos el modal
    this.userIdToDelete = userId;
  }

  confirmDelete(): void {
    if (this.userIdToDelete) {
      this.httpUsers.deleteUserById(this.userIdToDelete).subscribe({
        next: (data) => {
          console.log('🟢 User deleted', data);
          this.refreshTrigger$.next();
          this.closeDeleteModal();
        },
        error: (error) => {
          console.error('🔴 Error borrando usuario', error);
          this.closeDeleteModal();
        }
      });
    }
  }

  closeDeleteModal(): void {
    this.userIdToDelete = null;
  }
}
