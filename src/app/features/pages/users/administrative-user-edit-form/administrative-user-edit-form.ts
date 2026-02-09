import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpUsers } from '../../../../core/services/http-users';
import { HttpAdministrativeUsers } from '../../../../core/services/http-administrative-users';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
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
      password: new FormControl('', [Validators.minLength(8), Validators.maxLength(16)]),
      confirmPassword: new FormControl(''),
      status: new FormControl('inactive', [Validators.required])
    }, {
      // Usar tu validador con el tercer parámetro en true
      validators: matchValidator('password', 'confirmPassword', true)
    }
    )

  }

  /**
 * Limpia campos vacíos, null o undefined del objeto
 * @param obj Objeto con los datos del formulario
 * @returns Objeto limpio sin campos vacíos
 */
  private cleanEmptyFields(obj: any): any {
    const cleanedObj: any = {};

    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const value = obj[key];

        // ✅ Excluir campos vacíos, null, undefined, o strings vacíos
        const isEmpty =
          value === '' ||
          value === null ||
          value === undefined ||
          (typeof value === 'string' && value.trim() === '');

        if (!isEmpty) {
          cleanedObj[key] = value;
        }
      }
    }

    // ✅ Siempre eliminar confirmPassword (no debe ir al backend)
    delete cleanedObj.confirmPassword;

    return cleanedObj;
  }



  // TODO: Refactorizar el metodo ngOnInit
  // ¿Por qué? Porque un metodo ngOnInit no deberia tener logica de negocio
  // ¿Qué deberia tener? Solo la logica de inicializacion del componente
  // Y porque un metodo/funcion solo deberia hacer una sola cosa

  ngOnInit() {
    this.userId = this.activatedRoute.snapshot.paramMap.get('id');
    console.debug('🟢 userId ngOnInit() ->(administrative-user-edit-form.ts):', this.userId);

    if (this.userId) {
      this.httpUsers.getUserById(this.userId).subscribe({
        next: (user) => {
          // ✅ Validación por si viene null (del catchError)
          if (!user) {
            console.error('Usuario no encontrado');
            this.router.navigate(['/dashboard/users']);
            return;
          }

          console.debug('🟢 user limpio getUserById() ->(administrative-user-edit-form.ts):', user);

          // ✅ Carga de datos simplificada (sin user.user o user.profile)
          this.formData.patchValue({
            role: user.role,
            nuip: user.nuip,
            names: user.names,
            lastName: user.lastName,
            secondLastName: user.secondLastName,
            jobTitle: user.jobTitle,  // Viene del profile, pero ya está en el objeto raíz
            email: user.email,
            status: user.status
          });
        },
        error: (error) => {
          console.error('Error inesperado:', error);
        },
        complete: () => {
          console.debug('🟢 Petición completada ngOnInit() ->(administrative-user-edit-form.ts):');
        }
      });
    }
  }

  // Metodo con el cual vamos a capturar los datos del formulario al presionar el boton submit
  onSubmit() {
    console.debug('🟢 formData.value onSubmit()->(administrative-user-edit-form):', this.formData.value);

    // Verificamos si el formulario es valido
    if (this.formData.valid) {

      // Limpiar campos vacíos antes de enviar
      const userData = this.cleanEmptyFields(this.formData.value);
      console.debug('🟢 userData limpio (sin campos vacíos):', userData);

      // Actualiza --> Service
      this.httpUsers.updateUserById(
        this.userId,
        userData
      ).subscribe({
        next: (user) => {
          console.debug('🟢 Usuario actualizado:', user);
          this.formData.reset();
          this.router.navigate(['/dashboard/users']);
        },
        error: (error) => {
          console.error('Error al actualizar el usuario:', error);
        },
        complete: () => {
          console.debug('🟢 Petición onSubmit(updateAdministrativeUser) completada');
          this.formData.markAsUntouched();
        }
      });
    }
    else {
      console.error('Formulario invalido');
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
