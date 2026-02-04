import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import matchValidator from '../../../shared/validators/match.validator';
import { HttpAuth } from '../../../core/services/http-auth';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {

  //Atributo para almacenar los datos del formulario
  public formData!: FormGroup;

  constructor(private httpAuth: HttpAuth) {
    this.formData = new FormGroup({
      nuip: new FormControl('', [Validators.required, Validators.pattern('^[0-9]*$'), Validators.minLength(6), Validators.maxLength(10)]),
      names: new FormControl('', [Validators.required, Validators.pattern('^[a-zA-Z ]*$')]),
      lastName: new FormControl('', [Validators.required, Validators.pattern('^[a-zA-Z ]*$')]),
      secondLastName: new FormControl('', [Validators.pattern('^[a-zA-Z ]*$')]),
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required, Validators.minLength(8), Validators.maxLength(16)]),
      confirmPassword: new FormControl('', [Validators.required]),
      roleRequest: new FormControl('', [Validators.required]),
      jobTitle: new FormControl('Administrativo', [Validators.required, Validators.pattern('^[a-zA-Z ]*$')]),
      // signature: new FormControl('')
    },
      {
        validators: matchValidator('password', 'confirmPassword')
      }
    )
  }

  onSubmit() {
    if (this.formData.valid) {
      console.log(this.formData.value);

      this.httpAuth.register(this.formData.value).subscribe({
        next: (response) => {
          console.log("Usuario registrado exitosamente", response);
          this.formData.reset();
        },
        error: (error) => {
          console.log("Error al registrar el usuario", error);
        }
      });
    }
    else {
      console.log('Formulario inválido');
    }
  }

  onReset() {
    this.formData.reset();
  }

}
