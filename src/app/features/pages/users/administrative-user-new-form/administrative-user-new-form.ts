import { Component, ChangeDetectionStrategy } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpAdministrativeUsers } from '../../../../core/services/http-administrative-users';
import { Observable, Subscription } from 'rxjs';
import matchValidator from '../../../../shared/validators/match.validator';

@Component({
  selector: 'app-administrative-user-new-form',
  imports: [ReactiveFormsModule],
  templateUrl: './administrative-user-new-form.html',
  styleUrl: './administrative-user-new-form.css',
  // changeDetection: ChangeDetectionStrategy.OnPush, // Detecta cambios solo cuando hay cambios en el componente
})

export class AdministrativeUserNewForm {

  // TODO: <> Crear un servicio para obtener las categorias
  // users!: Observable<any[]>;
  // TODO: </> Crear un servicio para obtener las categorias

  //Atributo para almacenar los datos del formulario
  public formData!: FormGroup;

  // Controlar cuando se suscribe y se desuscribe a un observable
  registerSubscribed!: Subscription;

  constructor(private httpAdministrativeUser: HttpAdministrativeUsers) {
    this.formData = new FormGroup({
      role: new FormControl('', [Validators.required]),
      // users: new FormControl('', [Validators.required]),
      nuip: new FormControl('', [Validators.required, Validators.pattern('^[0-9]*$'), Validators.minLength(6), Validators.maxLength(10)]),
      names: new FormControl('', [Validators.required, Validators.pattern('^[a-zA-Z ]*$')]),
      lastName: new FormControl('', [Validators.required, Validators.pattern('^[a-zA-Z ]*$')]),
      secondLastName: new FormControl('', [Validators.pattern('^[a-zA-Z ]*$')]),
      jobTitle: new FormControl('ADMINISTRATIVO', [Validators.required, Validators.pattern('^[a-zA-Z ]*$')]),
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

  // Life cycle hooks
  // ngOnInit(): void {
  //   console.log('ngOnInit');
  //   this.users = this.httpAdministrativeUser.getAllUsers()
  //     .pipe(
  //       tap((data) => console.log('Datos obtenidos con tap', data)), //tap: Permite ver los datos que vienen del backend sin transformar
  //       // map((data) => data.map((user: any) => ({
  //       //   id: user.id,
  //       //   fullName: "Camilo"
  //       // }))), //map: Transforma los datos que vienen del backend
  //       // tap((data) => console.log('Datos obtenidos con tap', data)), //tap: Permite ver los datos que vienen del backend sin transformar
  //     );
  //   console.log('Puto el que lo lea Observable: ', this.users);
  // }

  // ngOnChanges(): void {
  //   console.log('ngOnChanges');
  // }

  // Metodo con el cual vamos a capturar los datos del formulario al presionar el boton submit
  onSubmit() {
    // Verificar si el formulario es valido
    // IMPORTANTE: Si los campos no tienen validaciones, el formulario siempre sera valido  
    if (this.formData.valid) {
      //   console.log(this.formData.value);
      console.log(this.formData.value);
      // Llamanr al servicio para crear un usario usando un objeto observable
      this.registerSubscribed = this.httpAdministrativeUser.createAdministrativeUser(this.formData.value).subscribe({
        next: (data) => { // Se ejecuta cuando la peticion es exitosa
          console.log('Administrative user created', data);
          this.formData.reset(); // Limpia los campos del formulario cuando la peticion es exitosa
        },
        error: (error) => { // Se ejecuta cuando la peticion falla
          console.error('Error creating administrative user', error);
        },
        complete: () => { // Se ejecuta cuando la peticion se completa
          //Toca todos los campos y activa o despliega los mensajes de error
          this.formData.markAsTouched();
        }
      })
    }
    else {
      console.error('Formulario invalido');
    }

  }

  // ngDoCheck(): void {
  //   console.log('ngDoCheck');
  // }

  onReset() {
    this.formData.setValue({
      role: '',
      nuip: '',
      names: '',
      lastName: '',
      secondLastName: '',
      jobTitle: 'ADMINISTRATIVO',
      email: '',
      password: '',
      status: 'inactive'
    });
  }

  // ngAfterContentInit(): void {
  //   console.log('ngAfterContentInit');
  // }

  // ngAfterContentChecked(): void {
  //   console.log('ngAfterContentChecked');
  // }

  // ngAfterViewInit(): void {
  //   console.log('ngAfterViewInit');
  // }

  // ngAfterViewChecked(): void {
  //   console.log('ngAfterViewChecked');
  // }

  ngOnDestroy() {
    // Validar que el observable no este suscrito
    if (this.registerSubscribed) {
      console.info('Componente destruido');
      this.registerSubscribed.unsubscribe(); //Desuscribirse manualmente
    }
  }


}