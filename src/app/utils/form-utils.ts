import {
  AbstractControl,
  FormControl,
  FormGroup,
  ValidatorFn,
} from '@angular/forms';
import { FormField } from '@app/models/form-field.model';

export type FormOf<T> = {
  [K in keyof T]: T[K] extends Record<string, Object>
    ? FormGroup<FormOf<T[K]>>
    : FormControl<T[K]>;
};

export abstract class BaseFormField {
  [key: string]: any;

  protected generateFormFieldElements(
    fields: FormFieldConfig[],
    formGroup: FormGroup<FormOf<any>>
  ) {
    fields.forEach((field) => {
      this[field.key] = {
        ...field.config,
        formGroup: formGroup,
      };
    });
  }
}

export interface FormFieldConfig {
  key: string;
  config: Partial<FormField<any>>;
}

export function dateRangeValidator(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: boolean } | null => {
    const dateOfBirth = control.get('dateOfBirth')?.value;

    if (dateOfBirth && dateOfBirth > new Date(2014, 1, 1)) {
      control.get('dateOfBirth')?.setErrors({ dateRangeInvalid: true });
      return { dateRangeInvalid: true };
    }
    return null;
  };
}
