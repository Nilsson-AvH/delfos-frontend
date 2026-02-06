import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpAuth } from '../../../core/services/http-auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {

  // Atributo para almacenar el formulario
  public formData!: FormGroup;

  constructor(
    private httpAuth: HttpAuth,
    private router: Router) {
    this.formData = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required, Validators.minLength(8), Validators.maxLength(12)]),
    });
  }

  // Metodo para manejar el envio del formulario
  onSubmit() {
    if (this.formData.valid) {
      console.log(this.formData.value);

      this.httpAuth.login(this.formData.value).subscribe({
        next: (response: any) => {
          console.log("Usuario logueado exitosamente", response);

          if (response.token && response.user) {
            this.httpAuth.saveLocalStorage(response.token, response.user); // Guarda datos en el localStorage
            this.router.navigate(['/dashboard']); // Redirecciona a la pagina de dashboard

          }
          this.formData.reset(); // Resetea el formulario


        },
        error: (error: any) => {
          console.log("Error al loguear el usuario", error);
        }
      });
    }
  }

  // Metodo para manejar el reseteo del formulario
  onReset() {
    this.formData.reset();
    this.formData.markAsPristine();
    this.formData.markAsUntouched();
  }

}
