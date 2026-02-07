import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpUsers } from '../../../../core/services/http-users';

@Component({
  selector: 'app-administrative-user-edit-form',
  imports: [],
  templateUrl: './administrative-user-edit-form.html',
  styleUrl: './administrative-user-edit-form.css',
})
export class AdministrativeUserEditForm {

  // Guarda el ID del usuario administrativo que viene de la URL
  userId!: string | null;

  constructor(

    // Dependencia que permite obtener los parametros de la URL
    private activatedRoute: ActivatedRoute,
    // Dependencia que permite obtener los usuarios
    private httpUsers: HttpUsers
  ) { }

  ngOnInit() {
    // Paso 1: Obtener el ID del usuario de la URL
    this.userId = this.activatedRoute.snapshot.paramMap.get('id');
    console.log(this.userId);

    // Paso 1.5: Validar si la ruta trae un ID
    if (this.userId) {
      // Paso 2: Obtener el usuario por ID
      this.httpUsers.getUserById(this.userId).subscribe({
        next: (user) => {
          console.log('Usuario encontrado:', user);
        },
        error: (error) => {
          console.error('Error al obtener el usuario:', error);
        },
        complete: () => {
          console.log('Petición ngOnInit(getUserById) completada');
        }
      });
    }
  }
}
