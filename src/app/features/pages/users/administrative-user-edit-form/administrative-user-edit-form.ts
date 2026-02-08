import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpUsers } from '../../../../core/services/http-users';
import { HttpAdministrativeUsers } from '../../../../core/services/http-administrative-users';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import matchValidator from '../../../../shared/validators/match.validator';

@Component({
  selector: 'app-administrative-user-edit-form',
  imports: [ReactiveFormsModule],
  templateUrl: './administrative-user-edit-form.html',
  styleUrl: './administrative-user-edit-form.css',
})
export class AdministrativeUserEditForm {

  // Atributo para almacenar los datos del formulario
  public formData!: FormGroup;

  // Controlar cuando se suscribe y se desuscribe a un observable
  registerSubscribed!: Subscription;

  // Guarda el ID del usuario administrativo que viene de la URL
  userId!: string | null;

  constructor(

    // Dependencia que permite obtener los parametros de la URL
    private activatedRoute: ActivatedRoute,
    // Dependencia que permite obtener los usuarios
    private httpUsers: HttpUsers,
    private httpAdministrativeUser: HttpAdministrativeUsers,
    private router: Router
  ) {
    this.formData = new FormGroup({
      role: new FormControl('', [Validators.required]),
      // users: new FormControl('', [Validators.required]),
      nuip: new FormControl('', [Validators.required, Validators.pattern('^[0-9]*$'), Validators.minLength(6), Validators.maxLength(10)]),
      names: new FormControl('', [Validators.required, Validators.pattern('^[a-zA-Z ]*$')]),
      lastName: new FormControl('', [Validators.required, Validators.pattern('^[a-zA-Z ]*$')]),
      secondLastName: new FormControl('', [Validators.pattern('^[a-zA-Z ]*$')]),
      jobTitle: new FormControl('Administrativo', [Validators.required, Validators.pattern('^[a-zA-Z ]*$')]),
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required, Validators.minLength(8), Validators.maxLength(16)]),
      confirmPassword: new FormControl('', [Validators.required]),
      status: new FormControl('inactive', [Validators.required])
    },
      {
        validators: matchValidator('password', 'confirmPassword')
      }
    )

  }

  // TODO: Refactorizar el metodo ngOnInit
  // ¿Por qué? Porque un metodo ngOnInit no deberia tener logica de negocio
  // ¿Qué deberia tener? Solo la logica de inicializacion del componente
  // Y porque un metodo/funcion solo deberia hacer una sola cosa

  ngOnInit() {
    // Paso 1: Obtener el ID del usuario de la URL
    this.userId = this.activatedRoute.snapshot.paramMap.get('id');
    console.log(this.userId);

    // Paso 1.5: Validar si la ruta trae un ID, para cargar los datos del usuario por ese ID
    if (this.userId) {
      // Paso 2: Obtener el usuario por ID
      this.httpUsers.getUserById(this.userId).subscribe({
        next: (user) => {
          console.log('Usuario encontrado:', user);
          // Paso 3: Cargar los datos del usuario en el formulario
          this.formData.patchValue({
            role: user.role,
            nuip: user.nuip,
            names: user.names,
            lastName: user.lastName,
            secondLastName: user.secondLastName,
            jobTitle: user.jobTitle,
            email: user.email,
            status: user.status
          });
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

  // Metodo con el cual vamos a capturar los datos del formulario al presionar el boton submit
  onSubmit() {
    console.log(this.formData.value);

    // Verificamos si el formulario es valido
    if (this.formData.invalid) {
      // Actualiza --> Service
      this.httpUsers.updateUserById(
        this.userId,
        this.formData.value
      ).subscribe({
        next: (user) => {
          console.log('Usuario actualizado:', user);
          this.formData.reset();
          this.router.navigate(['/users']);
        },
        error: (error) => {
          console.error('Error al actualizar el usuario:', error);
        },
        complete: () => {
          console.log('Petición onSubmit(updateAdministrativeUser) completada');
          this.formData.markAsUntouched();
        }
      });
    }
    else {
      console.log('Formulario invalido');
    }
  }

  onReset() {
    this.formData.reset();
  }

  // Cancelar la suscripción cuando el componente se destruye
  ngOnDestroy() {
    if (this.registerSubscribed) {
      this.registerSubscribed.unsubscribe();
    }
  }
}
