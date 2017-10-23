import { FormControl, FormGroup } from '@angular/forms';

/**
 * To validate whether an email is a valid input
 *
 * @param control  Pass from form submission
 *
 */
export function emailValidator(control: FormControl): { [key: string]: any } {
  const emailRegexp = /^[a-z0-9!#$%&'*+\/=?^_`{|}~.-]+@[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/i;
  if (control.value && !emailRegexp.test(control.value)) {
    return {invalidEmail: true};
  }
}

/**
 * To validate whether the password satisfies the regular expression
 *
 * @param control  Pass from form submission
 *
 */
export function passwordValidator(control: FormControl): { [key: string]: any } {
  const passwordRegexp = /^([0-9]+[a-zA-Z]+|[a-zA-Z]+[0-9]+)[0-9a-zA-Z]*$/i;
  if (control.value && !passwordRegexp.test(control.value)) {
    return {invalidPassword: true};
  }
}

/**
 * To validate whether two input passwords are equal
 *
 * @param {string} passwordKey  Pass from form submission
 * @param {string} confirmPasswordKey  Pass from form submission
 *
 */
export function matchingPasswords(passwordKey: string, confirmPasswordKey: string) {
  return (group: FormGroup): { [key: string]: any } => {

    const password = group.controls[passwordKey];
    const confirmPassword = group.controls[confirmPasswordKey];
    if (password.value !== confirmPassword.value && confirmPassword.value !== '') {
      return {
        mismatchedPasswords: true
      };
    }
  };
}
