import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators, FormBuilder } from '@angular/forms';
import { HttpClients } from '../../../../core/services/http-clients';
import { catchError, map, Observable, of, Subscription } from 'rxjs';
import { HttpUsers } from '../../../../core/services/http-users';
import { AsyncPipe } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-client-new-form',
  imports: [ReactiveFormsModule, AsyncPipe],
  templateUrl: './client-new-form.html',
  styleUrl: './client-new-form.css',
})
export default class ClientNewForm {

  // Atributo para almacenar los usuarios
  clientManager!: Observable<any[]>;

  public formData!: FormGroup;
  submitSubscription!: Subscription;

  constructor(
    private fb: FormBuilder,
    private httpClients: HttpClients,
    private httpUsers: HttpUsers,
    private router: Router,
  ) {
    this.initForm();
  }

  private initForm() {
    this.formData = this.fb.group({
      companyName: ['', Validators.required],
      nit: ['', Validators.required],
      address: ['', Validators.required],
      phone: ['', Validators.required],
      companyEmail: ['', Validators.required],
      // Select con los usuarios
      clientManager: ['', Validators.required],
    });
  }

  // Life cycle hooks
  ngOnInit(): void {
    // Obtenemos los usuarios con rol clientManager
    this.clientManager = this.httpUsers.getUsersByRole('clientManager')
      // Filtramos los usuarios con rol clientManager
      .pipe(
        // El map nos permite transformar los datos que vienen del backend
        // Estos datos vienen en un array de objetos
        map(users => users.filter(user => user.role === 'clientManager')),
        // El catchError nos permite manejar los errores
        catchError(error => of([]))
      );
  }

  goBack() {
    this.router.navigate(['/dashboard/clients']);
  }

  onSubmit() {
    if (this.formData.invalid) {
      this.formData.markAllAsTouched();
      console.log('🔴 Formulario inválido:', this.formData.value);
      return;
    }

    const payload = this.preparePayload(this.formData.value);
    console.log('🔴 Enviando payload cliente:', payload);

    let request$: any;

    request$ = this.httpClients.createClient(payload);

    this.submitSubscription = request$.subscribe({
      next: (response: any) => {
        console.log('🔴 Client created successfully:', response);
      },
      error: (error: any) => {
        console.error('🔴 Error creating client:', error);
      }
    });

  }

  private preparePayload(formData: any) {
    return {
      companyName: formData.companyName,
      nit: formData.nit,
      address: formData.address,
      phone: formData.phone,
      companyEmail: formData.companyEmail,
      clientManager: formData.clientManager,
    };
  }

  public onReset() {
    this.formData.reset();
  }
}
