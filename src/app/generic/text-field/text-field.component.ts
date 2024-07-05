import { Component, Input, OnInit } from '@angular/core';
import { ReactiveFormsModule, UntypedFormGroup } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { FormField } from '@app/models/form-field.model';

@Component({
  selector: 'app-text-field',
  standalone: true,
  imports: [MatInputModule, ReactiveFormsModule],
  templateUrl: './text-field.component.html',
})
export class TextFieldComponent implements OnInit {
  @Input({ required: true }) textFieldElement!: FormField<UntypedFormGroup>;

  minLength!: number;

  ngOnInit(): void {
    this.disableFieldElement();
  }

  isRequired = (): boolean => this.textFieldElement.isRequired ?? false;

  isMismatch = (): boolean =>
    this.textFieldElement.formGroup
      .get(this.textFieldElement.formControlName as string)
      ?.hasError('matching') ?? false;

  minLengthError = (): boolean => {
    const minLengthError = this.textFieldElement.formGroup.get(
      this.textFieldElement.formControlName as string
    )?.errors?.['minlength'];
    this.minLength = minLengthError?.requiredLength;
    return this.minLength > minLengthError?.actualLength;
  };

  private disableFieldElement(): void {
    if (this.textFieldElement.disable) {
      this.textFieldElement.formGroup
        .get(this.textFieldElement.formControlName as string)
        ?.disable();
    }
  }
}
