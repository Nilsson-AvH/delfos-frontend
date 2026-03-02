import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClients } from '../../../../core/services/http-clients';
import { HttpUsers } from '../../../../core/services/http-users';
import { Subscription, Observable, map, catchError, of, forkJoin } from 'rxjs';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-client-edit-form',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, AsyncPipe],
  templateUrl: './client-edit-form.html',
  styleUrls: ['./client-edit-form.css']
})
export default class ClientEditForm implements OnInit {

  public clientManagers$!: Observable<any[]>;
  public formData!: FormGroup;
  public isEditing: boolean = false; // Bandera para controlar el modo Lectura/Edición
  public clientId!: string | null;

  // Backup de los datos originales para el botón "Cancelar"
  private clientLoaded: any;
  private submitSubscription!: Subscription;

  constructor(
    private fb: FormBuilder,
    private httpClients: HttpClients,
    private httpUsers: HttpUsers,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    // 0. Cargar Client Managers para el select
    this.clientManagers$ = this.httpUsers.getUsersByRole('clientManager').pipe(
      map(users => users.filter(user => user.role === 'clientManager')),
      catchError(() => of([]))
    );

    // 1. Obtener ID de la URL
    this.clientId = this.activatedRoute.snapshot.paramMap.get('id');

    if (this.clientId) {
      this.loadClientData(this.clientId);
    } else {
      this.router.navigate(['/dashboard/clients']);
    }
  }

  // Inicializa el formulario base (sin datos)
  private initForm() {
    this.formData = this.fb.group({
      nit: ['', [Validators.required]],
      companyName: ['', [Validators.required]],
      address: ['', [Validators.required]],
      phone: ['', [Validators.required]],
      companyEmail: ['', [Validators.email]],
      clientManager: ['', [Validators.required]]
    });
  }

  // Carga la data, adapta el formulario y bloquea los campos
  private loadClientData(id: string) {
    this.httpClients.getClientById(id).subscribe({
      next: (client: any) => {
        if (!client) {
          this.router.navigate(['/dashboard/clients']);
          return;
        }

        // Solucionamos el problema del wrapper que envía el backend: { client: { ... } }
        const clientData = client.client || client;
        console.debug('🟢 Cliente cargado original:', clientData);

        // EXTRAER EL ID DEL MANAGER PARA QUE EL SELECT DE ANGULAR LO RECONOZCA
        // El backend via deep-populate nos entrega clientManager: { user: { _id: "..." }... }
        let extractedManagerId = '';
        if (clientData.clientManager && clientData.clientManager.user) {
          extractedManagerId = clientData.clientManager.user._id || clientData.clientManager.user.id;
        } else if (clientData.clientManager && clientData.clientManager._id) {
          extractedManagerId = clientData.clientManager._id;
        } else if (typeof clientData.clientManager === 'string') {
          extractedManagerId = clientData.clientManager;
        }

        // Clonamos la data para la UI y le inyectamos el ID limpio
        const formPayload = {
          ...clientData,
          clientManager: extractedManagerId // Aquí está la magia param el select
        };

        // Guardar persistencia del cliente original antes de alteraciones para el Botón Cancelar
        this.clientLoaded = { ...formPayload };

        // 2. Llenar los datos (PatchValue)
        this.formData.patchValue(formPayload);

        // 3. MODO LECTURA POR DEFECTO: Deshabilitar todo
        this.formData.disable();
      },
      error: (err) => console.error('Error cargando cliente', err)
    });
  }

  // Activa o Desactiva la edición
  toggleEditMode() {
    this.isEditing = !this.isEditing;

    if (this.isEditing) {
      // Habilitar formulario para editar
      this.formData.enable();

      // EXCEPCIÓN: Campos que NO se deben editar (Identificadores únicos de empresa)
      this.formData.get('nit')?.disable();

    } else {
      // Cancelar edición: Revertir cambios y bloquear
      this.formData.reset(); // Limpia

      // Volver a preparar la data plana desde el backup
      if (this.clientLoaded) {
        this.formData.patchValue(this.clientLoaded);
      }

      this.formData.disable(); // Bloquea
    }
  }

  // Redirige a la tabla principal
  goBack() {
    this.router.navigate(['/dashboard/clients']);
  }

  onSubmit() {
    if (this.formData.invalid) {
      this.formData.markAllAsTouched();
      return;
    }

    // Preparar data (Limpiar vacíos)
    const formValue = this.cleanEmptyFields(this.formData.getRawValue());
    const newManagerId = formValue.clientManager;

    // Removemos clientManager de los corporativos para no enviarlos a la ruta equivocada
    delete formValue.clientManager;

    // Revisamos si el Client Manager realmente fue cambiado
    const managerChanged = newManagerId && newManagerId !== this.clientLoaded.clientManager;

    const updateTasks: Observable<any>[] = [];

    // 1. Tarea corporativa general
    if (Object.keys(formValue).length > 0) {
      updateTasks.push(this.httpClients.updateClientById(this.clientId!, formValue));
    }

    // 2. Tarea Rotativa (Manager Assignment)
    if (managerChanged) {
      updateTasks.push(this.httpClients.updateClientManager(this.clientId!, newManagerId));
    }

    console.log('Enviando actualización de cliente. ¿Cambio de Manager?', managerChanged);

    if (updateTasks.length === 0) {
      this.isEditing = false; // No hay tareas que enviar
      return;
    }

    this.submitSubscription = forkJoin(updateTasks).subscribe({
      next: (results) => {
        console.log('Cliente actualizado (Múltiples endpoints):', results);
        this.isEditing = false;

        if (this.clientId) {
          this.loadClientData(this.clientId);
        }
      },
      error: (err) => console.error('Error actualizando cliente', err)
    });
  }

  private cleanEmptyFields(obj: any): any {
    const cleanedObj: any = {};
    for (const key in obj) {
      // Ignorar valores vacíos si es necesario
      if (obj[key] !== null && obj[key] !== undefined) {
        cleanedObj[key] = obj[key];
      }
    }
    return cleanedObj;
  }
}
