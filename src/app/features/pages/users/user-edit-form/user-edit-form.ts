import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpUsers } from '../../../../core/services/http-users';
import { Subscription } from 'rxjs';
import matchValidator from '../../../../shared/validators/match.validator';

@Component({
  selector: 'app-user-edit-form',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './user-edit-form.html',
  styleUrls: ['./user-edit-form.css'] // Asegúrate de tener este archivo o borrar la línea
})
export default class UserEditForm implements OnInit {

  public formData!: FormGroup;
  public isEditing: boolean = false; // Bandera para controlar el modo Lectura/Edición
  public userId!: string | null;

  // Backup de los datos originales para el botón "Cancelar"
  private userLoaded: any;
  private submitSubscription!: Subscription;

  // Flags para controlar la vista (Igual que en NewForm)
  public isOperational = false;
  public isClientManager = false;
  public isAdministrative = false;

  constructor(
    private fb: FormBuilder,
    private httpUsers: HttpUsers,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    // 1. Obtener ID de la URL
    this.userId = this.activatedRoute.snapshot.paramMap.get('id');

    if (this.userId) {
      this.loadUserData(this.userId);
    } else {
      this.router.navigate(['/dashboard/users']);
    }
  }

  // Inicializa el formulario base (sin datos)
  private initForm() {
    this.formData = this.fb.group({
      role: ['', [Validators.required]],
      nuip: ['', [Validators.required]],
      names: ['', [Validators.required, Validators.pattern('^[a-zA-Z ]*$')]],
      lastName: ['', [Validators.required, Validators.pattern('^[a-zA-Z ]*$')]],
      secondLastName: ['', [Validators.pattern('^[a-zA-Z ]*$')]],
      email: ['', [Validators.required, Validators.email]],
      // Password es opcional en edición (solo si se quiere cambiar)
      password: ['', [Validators.minLength(8), Validators.maxLength(16)]],
      confirmPassword: [''],
      status: ['', [Validators.required]]
    }, {
      validators: matchValidator('password', 'confirmPassword', true) // true = opcional si están vacíos
    });
  }

  // Carga la data, adapta el formulario y bloquea los campos
  private loadUserData(id: string) {
    this.httpUsers.getUserById(id).subscribe({
      next: (user: any) => {
        if (!user) {
          this.router.navigate(['/dashboard/users']);
          return;
        }

        console.debug('🟢 Usuario cargado:', user);
        this.userLoaded = user; // Guardar backup

        // 1. Configurar Flags según el rol que viene de la BD
        this.setRoleFlags(user.role);

        // 2. Construir el formulario dinámicamente según el rol
        this.buildDynamicForm(user.role);

        // 3. Llenar los datos (PatchValue)
        // 3. Preparar datos para el formulario (Aplanar objetos anidados)
        const flatUser = this.prepareUserData(user);

        this.formData.patchValue(flatUser);

        // 4. MODO LECTURA POR DEFECTO: Deshabilitar todo
        this.formData.disable();
      },
      error: (err) => console.error('Error cargando usuario', err)
    });
  }

  // Activa o Desactiva la edición
  toggleEditMode() {
    this.isEditing = !this.isEditing;

    if (this.isEditing) {
      // Habilitar formulario para editar
      this.formData.enable();

      // EXCEPCIÓN: Campos que NO se deben editar (Identificadores únicos)
      this.formData.get('nuip')?.disable();
      this.formData.get('email')?.disable();
      this.formData.get('role')?.disable(); // Cambiar rol suele requerir lógica compleja de backend, mejor bloquearlo
    } else {
      // Cancelar edición: Revertir cambios y bloquear
      this.formData.reset(); // Limpia

      // Volver a preparar la data plana desde el backup
      if (this.userLoaded) {
        const flatBackup = this.prepareUserData(this.userLoaded);
        this.formData.patchValue(flatBackup);
      }

      this.formData.disable(); // Bloquea
    }
  }

  // Redirige a la tabla principal
  goBack() {
    this.router.navigate(['/dashboard/users']);
  }

  // Define las banderas booleanas para el HTML
  private setRoleFlags(role: string) {
    this.isOperational = role === 'operational';
    this.isClientManager = role === 'clientManager';
    this.isAdministrative = ['superadmin', 'admin', 'auditor'].includes(role);
  }

  // Agrega los controles específicos según el rol (Reutilizando lógica de NewForm)
  private buildDynamicForm(role: string) {
    // Primero limpiamos por si acaso (aunque en onInit es una sola vez)
    // Aquí solo agregamos lo que falta.

    if (this.isAdministrative) {
      this.formData.addControl('jobTitle', new FormControl('', Validators.required));
    }
    else if (this.isOperational) {
      this.addOperationalControls();
    }
    else if (this.isClientManager) {
      this.addClientManagerControls();
    }
  }

  // --- MÉTODOS DE CONTROLES (Copiados de tu UserNewForm para consistencia) ---

  private addClientManagerControls() {
    this.formData.addControl('birthDate', new FormControl('', Validators.required));
    this.formData.addControl('birthPlace', new FormControl('', Validators.required));
    this.formData.addControl('issueDate', new FormControl('', Validators.required));
    this.formData.addControl('issuePlace', new FormControl('', Validators.required));
    this.formData.addControl('nationality', new FormControl('', Validators.required));
    this.formData.addControl('phones', new FormControl('', Validators.required));
    this.formData.addControl('address', new FormControl(''));
  }

  private addOperationalControls() {
    this.addClientManagerControls(); // Hereda los comunes

    // Exclusivos Operativo
    this.formData.addControl('gender', new FormControl('', Validators.required));
    this.formData.addControl('maritalStatus', new FormControl('', Validators.required));
    this.formData.addControl('height', new FormControl('', [Validators.required, Validators.min(0)]));
    this.formData.addControl('weight', new FormControl('', [Validators.required, Validators.min(0)]));
    this.formData.addControl('housingType', new FormControl('', Validators.required));
    this.formData.addControl('neighborhood', new FormControl('', Validators.required));

    // Contrato y Seguridad Social (Inicializar vacíos para que patchValue los llene si existen)

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


    // const extraFields = [
    //   'clientId', 'jobTitle', 'contractContent', 'contractValue', 'contractTermMonths',
    //   'startDate', 'endDate', 'arl', 'arlRisk', 'arlDate', 'eps', 'epsDate',
    //   'compensationFund', 'compensationDate', 'pensionFund', 'pensionDate',
    //   'severanceFund', 'severanceDate', 'lifeInsurance', 'lifeInsuranceDate',
    //   'hasVehicle', 'driversLicense', 'vehicleType', 'licenseCategory',
    //   'emergencyContact', 'emergencyContactPhone', 'emergencyContactRelationship'
    // ];

    // extraFields.forEach(field => {
    //   this.formData.addControl(field, new FormControl(''));
    // });
  }

  onSubmit() {
    if (this.formData.invalid) {
      this.formData.markAllAsTouched();
      return;
    }

    // Preparar data (Limpiar vacíos, eliminar confirmPassword)
    const formValue = this.cleanEmptyFields(this.formData.getRawValue()); // getRawValue incluye los disabled

    console.log('Enviando actualización:', formValue);

    this.submitSubscription = this.httpUsers.updateUserById(this.userId, formValue).subscribe({
      next: (updatedUser) => {
        console.log('Usuario actualizado', updatedUser);

        // Finalizar modo edición
        this.isEditing = false;

        // Recargar el usuario completo desde el backend para asegurar que 
        // la estructura anidada (nested objects) esté actualizada y sincronizada
        if (this.userId) {
          this.loadUserData(this.userId);
        }
      },
      error: (err) => console.error('Error actualizando', err)
    });
  }

  private cleanEmptyFields(obj: any): any {
    const cleanedObj: any = {};
    for (const key in obj) {
      // Ignorar confirmPassword y valores vacíos si es necesario
      if (key !== 'confirmPassword' && obj[key] !== null && obj[key] !== undefined) {
        cleanedObj[key] = obj[key];
      }
    }
    // Si el password viene vacío, no lo enviamos para no borrar el hash en BD
    if (!cleanedObj.password) delete cleanedObj.password;

    return cleanedObj;
  }

  // Ayudante para cortar la hora de las fechas ISO (2026-02-14T...) -> (2026-02-14)
  private formatDatesForInput(obj: any) {
    for (const key in obj) {
      if (typeof obj[key] === 'string' && obj[key].includes('T')) {
        // Expresión regular simple o split para detectar fecha ISO
        // Si el valor parece una fecha ISO (YYYY-MM-DDTHH:mm:ss...)
        if (/^\d{4}-\d{2}-\d{2}T/.test(obj[key])) {
          obj[key] = obj[key].split('T')[0];
        }
      }
    }
  }

  private prepareUserData(user: any): any {
    const flatUser = {
      ...user,
      ...user.currentContract,
      ...user.currentSocialSecurity,
      clientId: user.currentClient?._id,
      phones: Array.isArray(user.phones) && user.phones.length > 0 ? user.phones[0] : user.phones,
    };

    // Formatear fechas
    this.formatDatesForInput(flatUser);

    // Eliminar password para que no se muestre el hash en el formulario
    delete flatUser.password;

    return flatUser;
  }
}