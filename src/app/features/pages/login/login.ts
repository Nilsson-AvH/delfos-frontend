import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {

  // Atributo para almacenar el formulario
  public formData!: FormGroup;

  constructor() {
    this.formData = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required, Validators.minLength(8), Validators.maxLength(12)]),
    });
  }

  // Metodo para manejar el envio del formulario
  onSubmit() {
    if (this.formData.valid) {
      console.log(this.formData.value);
    }
  }

  // Metodo para manejar el reseteo del formulario
  onReset() {
    this.formData.reset();
  }

}
