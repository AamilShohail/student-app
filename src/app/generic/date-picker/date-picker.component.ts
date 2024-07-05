import { Component, Input } from '@angular/core';
import { ReactiveFormsModule, UntypedFormGroup } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormField } from '@app/models/form-field.model';

@Component({
  selector: 'app-date-picker',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    ReactiveFormsModule,
  ],
  templateUrl: './date-picker.component.html',
  styleUrl: './date-picker.component.scss',
})
export class DatePickerComponent {
  @Input({ required: true }) dateFieldElement!: FormField<UntypedFormGroup>;

  isRequired = (): boolean => this.validateField('required');

  isInvalidDob = (): boolean => this.validateField('dateRangeInvalid');

  private validateField = (property: string): boolean =>
    this.dateFieldElement.formGroup
      .get(this.dateFieldElement.formControlName as string)
      ?.hasError(property) ?? false;
}
