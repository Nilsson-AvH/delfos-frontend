import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import matchValidator from '../../../shared/validators/match.validator';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {

  //Atributo para almacenar los datos del formulario
  public formData!: FormGroup;

  constructor() {
    this.formData = new FormGroup({
      roleRequest: new FormControl('', [Validators.required]),
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

  onSubmit() {
    if (this.formData.valid) {
      console.log(this.formData.value);
    }
  }

  onReset() {
    this.formData.reset();
  }

}
