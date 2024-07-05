export interface FormField<FormGroup> {
  label?: string;
  placeholder?: string;
  isRequired?: boolean;
  formControlName: string | number | null;
  type?: 'password' | 'email' | 'password' | 'number' | 'tel';
  formGroup: FormGroup;
  enableTextarea: boolean;
  disable: boolean;
}
