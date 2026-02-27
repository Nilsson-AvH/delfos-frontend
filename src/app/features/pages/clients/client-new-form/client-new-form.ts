import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators, FormBuilder } from '@angular/forms';
import { HttpClients } from '../../../../core/services/http-clients';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-client-new-form',
  imports: [ReactiveFormsModule],
  templateUrl: './client-new-form.html',
  styleUrl: './client-new-form.css',
})
export default class ClientNewForm {

  public formData!: FormGroup;
  private submitSubscription!: Subscription;

  constructor(
    private fb: FormBuilder,
    private httpClients: HttpClients
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
      clientManager: ['', Validators.required],
    });
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
