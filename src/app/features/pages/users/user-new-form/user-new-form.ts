import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators, FormBuilder } from '@angular/forms';
import { HttpUsers } from '../../../../core/services/http-users'; // Usaremos HttpUsers general
import { Router } from '@angular/router';
import { map, Observable, Subscription, tap } from 'rxjs';
import matchValidator from '../../../../shared/validators/match.validator';
import { CommonModule, AsyncPipe } from '@angular/common'; // Para directivas básicas
import { HttpClients } from '../../../../core/services/http-clients';

@Component({
  selector: 'app-user-new-form',
  standalone: true, // Asumo que usas standalone components por los imports anteriores
  imports: [ReactiveFormsModule, CommonModule, AsyncPipe],
  templateUrl: './user-new-form.html',
  styleUrl: './user-new-form.css',
})
export default class UserNewForm implements OnInit, OnDestroy {

  public formData!: FormGroup;
  private roleSubscription!: Subscription;
  private submitSubscription!: Subscription;

  // Flags para controlar la vista
  public isOperational = false;
  public isClientManager = false;
  public isAdministrative = false;

  public clients$: Observable<any[]> = new Observable<any[]>;

  constructor(
    private fb: FormBuilder,
    private httpUsers: HttpUsers, // Usar el servicio genérico
    private router: Router,

    // ✅ Injectar el nuevo servicio de Clientes
    private httpClients: HttpClients

  ) {
    this.initForm();
  }

  ngOnInit(): void {
    // Escuchar cambios en el Rol para mutar el formulario
    this.roleSubscription = this.formData.get('role')!.valueChanges.subscribe(role => {
      this.onRoleChange(role);
    });
  }

  goBack() {
    this.router.navigate(['/dashboard/users']);
  }

  private initForm() {
    // 1. Campos Base (Siempre existen)
    this.formData = this.fb.group({
      role: ['', [Validators.required]],
      nuip: ['', [Validators.required, Validators.pattern('^[0-9]*$'), Validators.minLength(6), Validators.maxLength(10)]],
      names: ['', [Validators.required, Validators.pattern('^[a-zA-Z ]*$')]],
      lastName: ['', [Validators.required, Validators.pattern('^[a-zA-Z ]*$')]],
      secondLastName: ['', [Validators.pattern('^[a-zA-Z ]*$')]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(16)]],
      confirmPassword: ['', [Validators.required]],
      status: ['inactive', [Validators.required]],
      photo: [null]
    }, {
      validators: matchValidator('password', 'confirmPassword')
    });
  }

  // ✅ Método para manejar la selección del archivo
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Opcional: Validar que sea una imagen
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (validTypes.includes(file.type)) {
        this.formData.patchValue({ photo: file });
      } else {
        alert('Por favor selecciona un archivo de imagen válido.');
        this.formData.patchValue({ photo: null });
        event.target.value = '';
      }
    }
  }

  /**
   * Lógica Central: Muta el formulario según el rol seleccionado
   */
  private onRoleChange(role: string) {
    this.isOperational = role === 'operational';
    this.isClientManager = role === 'clientManager';
    this.isAdministrative = ['superadmin', 'admin', 'auditor'].includes(role);

    // 1. Limpiar controles específicos previos para evitar basura
    this.removeSpecificControls();

    // 2. Agregar controles según el rol
    if (this.isAdministrative) {
      this.formData.addControl('jobTitle', new FormControl('Administrativo', Validators.required));
    }
    else if (this.isOperational) {
      this.addOperationalControls();
    }
    else if (this.isClientManager) {
      this.addClientManagerControls();
    }
  }

  private removeSpecificControls() {
    const controlsToRemove = [
      // ===== CAMPOS ADMINISTRATIVOS =====
      'jobTitle', // Se usa en Admin Y Operational (por eso debe estar aquí)

      // ===== CAMPOS COMUNES (ClientManager + Operational) =====
      'birthDate',
      'birthPlace',
      'issueDate',
      'issuePlace',
      'nationality',
      'phones',
      'address',

      // ===== CAMPOS ESPECÍFICOS DE OPERATIONAL =====
      // Operational Details
      'gender',
      'maritalStatus',
      'height',
      'weight',
      'housingType',
      'neighborhood',

      // Job Assignment
      'clientId',

      // Contract Information
      'contractContent',
      'contractValue',
      'contractTermMonths',
      'startDate',
      'endDate',

      // Social Security
      'arl',
      'arlRisk',
      'arlDate',
      'eps',
      'epsDate',
      'compensationFund',
      'compensationDate',
      'pensionFund',
      'pensionDate',
      'severanceFund',
      'severanceDate',
      'lifeInsurance',
      'lifeInsuranceDate',

      // Mobility Data
      'hasVehicle',
      'driversLicense',
      'vehicleType',
      'licenseCategory',

      // Emergency Contact
      'emergencyContact',
      'emergencyContactPhone',
      'emergencyContactRelationship',
    ];
    controlsToRemove.forEach(controlName => {
      if (this.formData.contains(controlName)) {
        this.formData.removeControl(controlName);
      }
    });
  }

  private addClientManagerControls() {
    // Campos requeridos por UserClientManager.model.js
    this.formData.addControl('birthDate', new FormControl('', Validators.required));
    this.formData.addControl('birthPlace', new FormControl('', Validators.required));
    this.formData.addControl('issueDate', new FormControl('', Validators.required));
    this.formData.addControl('issuePlace', new FormControl('', Validators.required));
    this.formData.addControl('nationality', new FormControl('Colombiano', Validators.required));
    this.formData.addControl('phones', new FormControl('', Validators.required)); // Podría ser un FormArray luego
    this.formData.addControl('address', new FormControl(''));
  }

  private addOperationalControls() {
    // Reutilizamos los de ClientManager que son comunes
    this.addClientManagerControls();

    // Agregamos los exclusivos de Operativo (UserOperational.model.js)

    // Operational Details
    this.formData.addControl('gender', new FormControl('', Validators.required));
    this.formData.addControl('maritalStatus', new FormControl('', Validators.required));
    this.formData.addControl('height', new FormControl('', [Validators.required, Validators.min(0)]));
    this.formData.addControl('weight', new FormControl('', [Validators.required, Validators.min(0)]));
    this.formData.addControl('housingType', new FormControl('', Validators.required));
    this.formData.addControl('neighborhood', new FormControl('', Validators.required));

    //Job Assignment

    // NOTA: Operational requiere Contract y SocialSecurity. 
    // Lo ideal seria tener pasos (Wizard) o pestañas, pero por ahora irán aquí si son obligatorios.
    // O se pueden crear en null y llenar luego en la edición.

    // Asignacion de puesto al trabajador
    this.formData.addControl('clientId', new FormControl(''));
    // Contrato inicial
    this.formData.addControl('jobTitle', new FormControl(''));
    this.formData.addControl('contractContent', new FormControl(''));
    this.formData.addControl('contractValue', new FormControl(''));
    this.formData.addControl('contractTermMonths', new FormControl(''));
    this.formData.addControl('startDate', new FormControl(''));
    this.formData.addControl('endDate', new FormControl(''));
    // Social Security
    this.formData.addControl('arl', new FormControl('AXA Colpatria'));
    this.formData.addControl('arlRisk', new FormControl(''));
    this.formData.addControl('arlDate', new FormControl(''));
    this.formData.addControl('eps', new FormControl(''));
    this.formData.addControl('epsDate', new FormControl(''));
    this.formData.addControl('compensationFund', new FormControl('Colsubsidio'));
    this.formData.addControl('compensationDate', new FormControl(''));
    this.formData.addControl('pensionFund', new FormControl(''));
    this.formData.addControl('pensionDate', new FormControl(''));
    this.formData.addControl('severanceFund', new FormControl(''));
    this.formData.addControl('severanceDate', new FormControl(''));
    this.formData.addControl('lifeInsurance', new FormControl(''));
    this.formData.addControl('lifeInsuranceDate', new FormControl(''));
    // Mobility Data
    this.formData.addControl('hasVehicle', new FormControl(false));
    this.formData.addControl('driversLicense', new FormControl(false));
    this.formData.addControl('vehicleType', new FormControl('Ninguno'));
    this.formData.addControl('licenseCategory', new FormControl('N/A'));
    // Emergency Contact
    this.formData.addControl('emergencyContact', new FormControl(''));
    this.formData.addControl('emergencyContactPhone', new FormControl(''));
    this.formData.addControl('emergencyContactRelationship', new FormControl(''));

    // Acá la idea es traer todos los clientes para el select, 
    // pero por ahora solo hay uno de pruebas
    this.clients$ = this.httpClients.getAllClients(1, 1000, '').pipe(
      map((response: any) => response.clients)
      // tap(res => console.log('🔴 Clients data', res))
    );

  }

  onSubmit() {
    if (this.formData.invalid) {
      this.formData.markAllAsTouched();
      return;
    }

    const payload = this.preparePayload(this.formData.value);
    console.log('🔴 Enviando Payload:', payload);

    // IMPORTANTE: Asegúrate de que tu HttpUsers tenga un método 'createUser' genérico
    // que apunte a /v1/users. El backend debe ser capaz de rutear internamente o
    // tu servicio debe decidir el endpoint según el rol.

    // Asumiendo que usas el mismo endpoint /v1/users y el backend discrimina por 'role'
    // O si tienes endpoints separados:
    let request$: any;

    // Aquí decides la estrategia de envío.
    // Opción A: Un solo endpoint inteligente en backend.
    request$ = this.httpUsers.createUser(payload);

    this.submitSubscription = request$.subscribe({
      next: (data: any) => {
        console.log('🔴 User created', data);
        
        // Extraemos de forma segura el userId del backend
        const userId = data?.data?.userId || data?.data?.user?._id || data?.data?._id;
        const photoFile = this.formData.get('photo')?.value;

        if (userId && photoFile) {
          console.log('🔴 Subiendo foto para el usuario:', userId);
          this.httpUsers.uploadUserPhoto(userId, photoFile).subscribe({
            next: (photoRes) => {
              console.log('🔴 Foto subida exitosamente:', photoRes);
              this.router.navigate(['/dashboard/users']);
            },
            error: (photoErr) => {
              console.error('🔴 Error subiendo la foto:', photoErr);
              // Redirigir de todos modos ya que el usuario se creó correctamente
              this.router.navigate(['/dashboard/users']);
            }
          });
        } else {
          this.router.navigate(['/dashboard/users']);
        }
      },
      error: (error: any) => console.error('🔴 Error creating user', error)
    });
  }

  /**
   * Adapta la data plana del formulario a la estructura anidada que pueda requerir el backend
   * si tus modelos de backend esperan objetos separados (ej: { user: {...}, operational: {...} })
   * Si tu backend maneja todo plano en el body, esto no es necesario.
   */
  private preparePayload(formValue: any): any {
    // Clonamos para no mutar el valor del formulario directamente
    const payload = { ...formValue };

    // Si tu backend espera, por ejemplo, los teléfonos como array:
    if (payload.phones && typeof payload.phones === 'string') {
      payload.phones = [payload.phones];
    }

    // Eliminamos la foto del payload JSON ya que se subirá vía FormData
    delete payload.photo;

    return payload;
  }

  onReset() {
    this.formData.reset({
      status: 'inactive'
    });
    this.isOperational = false;
    this.isClientManager = false;
    this.isAdministrative = false;
  }

  ngOnDestroy() {
    this.roleSubscription?.unsubscribe();
    this.submitSubscription?.unsubscribe();
  }
}