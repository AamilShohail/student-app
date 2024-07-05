import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Component, DestroyRef, Inject, OnInit } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  MatDialogModule,
  MatDialogTitle,
  MatDialogContent,
  MatDialogActions,
  MatDialogClose,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { ResponseDto } from '@app/dtos/response.dto';
import { StudentDto } from '@app/dtos/student-request.dto';
import { StudentInfoDto } from '@app/dtos/student-response.dto';
import { DatePickerComponent } from '@app/generic/date-picker/date-picker.component';
import { ImageFileUploaderComponent } from '@app/generic/image-file-uploader/image-file-uploader.component';
import { TextFieldComponent } from '@app/generic/text-field/text-field.component';
import { FormField } from '@app/models/form-field.model';
import { BaseEntityService } from '@app/services/base-entity.service';
import { ImageFileService } from '@app/services/image-file.service';
import {
  BaseFormField,
  FormFieldConfig,
  FormOf,
  dateRangeValidator,
} from '@app/utils/form-utils';
import { ToastrService } from 'ngx-toastr';
import { take } from 'rxjs';

@Component({
  selector: 'app-student-dialog',
  standalone: true,
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    MatInputModule,
    ReactiveFormsModule,
    TextFieldComponent,
    DatePickerComponent,
    ImageFileUploaderComponent,
  ],
  templateUrl: './student-dialog.component.html',
  styleUrl: './student-dialog.component.scss',
})
export class StudentDialogComponent extends BaseFormField implements OnInit {
  title!: string;
  loading = false;
  studentForm!: FormGroup<FormOf<StudentDto>>;
  selectedImageFile!: File;

  /* Field declarations */
  firstNameField!: FormField<FormGroup<FormOf<StudentDto>>>;
  lastNameField!: FormField<FormGroup<FormOf<StudentDto>>>;
  usernameField!: FormField<FormGroup<FormOf<StudentDto>>>;
  emailField!: FormField<FormGroup<FormOf<StudentDto>>>;
  addressField!: FormField<FormGroup<FormOf<StudentDto>>>;
  nicNumberField!: FormField<FormGroup<FormOf<StudentDto>>>;
  nameField!: FormField<FormGroup<FormOf<StudentDto>>>;
  dateOfBirthField!: FormField<FormGroup<FormOf<StudentDto>>>;
  phoneNumberField!: FormField<FormGroup<FormOf<StudentDto>>>;

  constructor(
    private toastr: ToastrService,
    private dialogRef: MatDialogRef<any>,
    private destroyRef: DestroyRef,
    private baseEntityService: BaseEntityService,
    @Inject(MAT_DIALOG_DATA)
    public data: any,
    private imageFileService: ImageFileService,
    private http: HttpClient
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializeStudentForm();
    this.initializeStudentFields();
    this.setFormValuesOnEdit();
    this.subscribeToSelectedImage();
  }

  save(): void {
    this.startLoading();
    this.saveEntity();
  }

  clearForm(): void {
    this.studentForm.reset();
  }

  private startLoading(): void {
    this.loading = true;
  }

  private subscribeToSelectedImage(): void {
    this.imageFileService.selectedImageFile$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((file) => {
        this.selectedImageFile = file;
        const targetFilePath = `src/assets/img/${
          this.selectedImageFile.lastModified + this.selectedImageFile.name
        }`;

        this.saveImage();
      });
  }

  private saveImage() {
    var myFormData = new FormData();

    const headers = new HttpHeaders()
      .set('Content-Type', 'multipart/form-data')
      .set('Accept', 'application/json');
    myFormData.append('image', this.selectedImageFile);
    /* Image Post Request */
    this.http
      .post(
        `assets/img/${
          this.selectedImageFile.lastModified + this.selectedImageFile.name
        }`,
        myFormData,
        {
          headers: headers,
        }
      )
      .subscribe((data) => {
        //Check success message
        console.log(data);
      });
  }

  private stopLoading(): void {
    this.loading = false;
  }

  private showError(message: string, errorTitle: string): void {
    this.toastr.error(errorTitle, message);
  }

  private saveEntity(): void {
    this.baseEntityService
      .saveEntity<StudentInfoDto>(
        {
          ...this.studentForm.getRawValue(),
          dateOfBirth: new Date(
            this.studentForm.getRawValue().dateOfBirth as Date
          )
            .toISOString()
            .split('T')[0],
          imageUrl: `/assets/img/${this.selectedImageFile?.name}`,
        },
        this.data.saveEndpoint
      )
      .pipe(take(1))
      .subscribe({
        next: (result: ResponseDto<StudentInfoDto>) =>
          this.handleSaveResult(result),
        error: (err: HttpErrorResponse) => this.handleSaveError(err),
      });
  }

  private setFormValuesOnEdit(): void {
    if (this.data?.node) {
      this.studentForm.patchValue(this.data.node);
    }
    this.title = this.data?.node ? `Edit` : `Add`;
  }

  private handleSaveResult(result: ResponseDto<StudentInfoDto>): void {
    if (!result.succeeded) {
      if (result.errors?.length) {
        this.handleFailure(result.errors[0].code, result.errors[0].description);
        return;
      }
      this.handleFailure('Save Failed', result.responseMessage);
      return;
    }
    this.handleSuccess(result);
  }

  private handleSuccess(result: ResponseDto<StudentInfoDto>): void {
    const transaction = this.data.node
      ? { update: [result.data] }
      : { add: [result.data] };
    this.data.gridApi.applyTransaction(transaction);

    this.toastr.success(`Student is added successfully`);
    this.dialogRef.close();
  }

  private handleFailure(message: string, errorTitle: string): void {
    this.showError(message, errorTitle);
    this.stopLoading();
  }

  private handleSaveError(err: HttpErrorResponse): void {
    this.stopLoading();
    this.showError(err.name, err.message);
  }

  private initializeStudentForm(): void {
    this.studentForm = new FormGroup<FormOf<StudentDto>>(
      {
        id: new FormControl(''),
        firstName: new FormControl('', [Validators.required]),
        lastName: new FormControl('', [Validators.required]),
        username: new FormControl(''),
        email: new FormControl('', [Validators.required, Validators.email]),
        address: new FormControl(''),
        dateOfBirth: new FormControl(null, [Validators.required]),
        phoneNumber: new FormControl(''),
        nicNumber: new FormControl('', [Validators.required]),
      },
      {
        validators: [dateRangeValidator()],
      }
    );
  }

  private initializeStudentFields(): void {
    const fields: FormFieldConfig[] = [
      {
        key: 'firstNameField',
        config: {
          label: 'First Name',
          isRequired: true,
          placeholder: 'Enter first name',
          formControlName: 'firstName',
        },
      },
      {
        key: 'lastNameField',
        config: {
          label: 'Last Name',
          placeholder: 'Enter last name',
          formControlName: 'lastName',
          isRequired: true,
        },
      },
      {
        key: 'usernameField',
        config: {
          label: 'Username',
          placeholder: 'Enter username',
          formControlName: 'username',
        },
      },
      {
        key: 'emailField',
        config: {
          label: 'Email',
          placeholder: 'Enter email',
          formControlName: 'email',
          isRequired: true,
        },
      },
      {
        key: 'addressField',
        config: {
          label: 'Address',
          formControlName: 'address',
          enableTextarea: true,
        },
      },
      {
        key: 'nicNumberField',
        config: {
          label: 'NIC Number',
          formControlName: 'nicNumber',
          isRequired: true,
        },
      },
      {
        key: 'phoneNumberField',
        config: {
          label: 'Phone Number',
          formControlName: 'phoneNumber',
        },
      },
      {
        key: 'dateOfBirthField',
        config: {
          label: 'Date of Birth',
          formControlName: 'dateOfBirth',
          isRequired: true,
        },
      },
    ];
    this.generateFormFieldElements(fields, this.studentForm);
  }
}
