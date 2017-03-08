import {FormControl, FormGroup} from '@angular/forms';

/*
 Custom validators to use everywhere.
 */

// SINGLE FIELD VALIDATORS
export function emailValidator(control: FormControl): {[key: string]: any} {
  const emailRegexp = /^[a-z0-9!#$%&'*+\/=?^_`{|}~.-]+@[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/i;
  if (control.value && !emailRegexp.test(control.value)) {
    return { invalidEmail: true };
  }
}

// Password VALIDATORS
export function passwordValidator(control: FormControl): {[key: string]: any} {
  const passwordRegexp = /^([0-9]+[a-zA-Z]+|[a-zA-Z]+[0-9]+)[0-9a-zA-Z]*$/i;
  if (control.value && !passwordRegexp.test(control.value)) {
    return { invalidPassword: true };
  }
}

// FORM GROUP VALIDATORS
export function matchingPasswords(passwordKey: string, confirmPasswordKey: string) {
  return (group: FormGroup): {[key: string]: any} => {

    const password = group.controls[passwordKey];
    const confirmPassword = group.controls[confirmPasswordKey];
    if (password.value !== confirmPassword.value && confirmPassword.value !== '') {
      return {
        mismatchedPasswords: true
      };
    }
  };
}
