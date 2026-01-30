import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Validador genérico para comparar dos campos.
 * @param controlName El nombre del campo principal (ej: 'password')
 * @param matchingControlName El nombre del campo de confirmación (ej: 'confirmPassword')
 */

// ValidatorFn: es una funcion que recibe un AbstractControl y retorna ValidationErrors o null
// AbstractControl: es la clase base para todos los controles del formulario
// ValidationErrors: es un objeto que contiene los errores del control
// null: significa que no hay errores
// { mismatch: true }: significa que hay un error de coincidencia

// matchValidator: es una funcion que recibe dos nombres de campos y retorna un ValidatorFn
function matchValidator(controlName: string, matchingControlName: string): ValidatorFn {
    // abstractControl: es el control que queremos validar
    return (abstractControl: AbstractControl): ValidationErrors | null => {
        // control: es el control que queremos validar
        const control = abstractControl.get(controlName);
        // matchingControl: es el control con el que queremos comparar
        const matchingControl = abstractControl.get(matchingControlName);

        // Si alguno de los controles no existe, no hacemos nada
        if (!control || !matchingControl) {
            // Si alguno de los controles no existe, no hacemos nada
            return null;
        }

        // Si el campo de confirmación ya tiene otro error (ej: required), no lo sobrescribimos
        if (matchingControl.errors && !matchingControl.errors['mismatch']) {
            // Si el campo de confirmación ya tiene otro error (ej: required), no lo sobrescribimos
            return null;
        }

        // Comparamos los valores
        if (control.value !== matchingControl.value) {
            // Si son diferentes, le ponemos el error al campo 'matchingControl'
            matchingControl.setErrors({ mismatch: true });
            return { mismatch: true };
        } else {
            // Si son iguales y tenía el error 'mismatch', se lo quitamos
            if (matchingControl.errors && matchingControl.errors['mismatch']) {
                // Si son iguales y tenía el error 'mismatch', se lo quitamos
                delete matchingControl.errors['mismatch'];
                // Si no tiene más errores, lo quitamos
                if (Object.keys(matchingControl.errors).length === 0) {
                    // Si no tiene más errores, lo quitamos
                    matchingControl.setErrors(null);
                }
            }
            // Si no hay errores, retornamos null o sea que el control es valido o los controles son iguales
            return null;
        }
    };
}

export default matchValidator;