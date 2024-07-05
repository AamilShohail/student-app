import { Component, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AgGridAngular } from 'ag-grid-angular';
import {
  ColDef,
  SelectionChangedEvent,
  GridApi,
  GridReadyEvent,
  GridOptions,
  GetRowIdParams,
  GetContextMenuItemsParams,
  MenuItemDef,
} from 'ag-grid-community';
import { ToastrService } from 'ngx-toastr';
import { BaseEntityService } from '@app/services/base-entity.service';
import { ResponseDto } from '@app/dtos/response.dto';
import { EMPTY, switchMap, take } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { StudentInfoDto } from '@app/dtos/student-response.dto';
import { MatDialog } from '@angular/material/dialog';
import { StudentDialogComponent } from '../student-dialog/student-dialog.component';
import { DeleteConfirmationDialogComponent } from '@app/generic/delete-confirmation-dialog/delete-confirmation-dialog.component';
import { StudentDto } from '@app/dtos/student-request.dto';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import 'ag-grid-enterprise';
import { StudentMoreInfoDialogComponent } from '../student-more-info-dialog/student-more-info-dialog.component';

@Component({
  selector: 'app-student-grid',
  standalone: true,
  imports: [
    AgGridAngular,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
  ],
  templateUrl: './student-grid.component.html',
  styleUrl: './student-grid.component.scss',
})
export class StudentGridComponent implements OnInit {
  gridStyle!: any;
  disable = true;
  gridApi!: GridApi;
  colDefs!: ColDef<StudentInfoDto>[];
  rowData!: StudentInfoDto[];
  gridOptions!: GridOptions<StudentInfoDto>;

  private currentSelectedNode!: StudentInfoDto | undefined;

  constructor(
    private baseEntityService: BaseEntityService,
    private toastr: ToastrService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.setupGridStyles();
    this.setupGridOptions();
    this.setupStudentColumnDefinition();
    this.subscribeToEntityData();
  }

  onRowSelectionChange(event: SelectionChangedEvent<StudentInfoDto>): void {
    this.currentSelectedNode = event.api.getSelectedNodes()[0]?.data;
    this.disable = !this.currentSelectedNode;
  }

  refreshGrid(): void {
    this.subscribeToEntityData();
  }

  getContextMenuItems(
    params: GetContextMenuItemsParams
  ): (string | MenuItemDef)[] {
    return [
      {
        // custom item
        name: `Click for more information about ${params.node?.data.firstName}`,
        action: () => {
          const ctx = params.context.componentParent as StudentGridComponent;
          ctx.openComposeDialog(params);
        },
      },
    ];
  }

  openDialog(edit?: boolean): void {
    this.dialog.open(StudentDialogComponent, {
      width: '40%',
      maxWidth: '100%',
      enterAnimationDuration: '500ms',
      data: {
        node: edit ? this.currentSelectedNode : null,
        gridApi: this.gridApi,
        saveEndpoint: 'student',
      },
    });
  }

  deleteRecord(): void {
    const dialogRef = this.dialog.open(DeleteConfirmationDialogComponent, {
      height: '200px',
      enterAnimationDuration: '500ms',
      width: '600px',
    });
    dialogRef
      .afterClosed()
      .pipe(
        take(1),
        switchMap((isDeleteConfirmed: boolean) => {
          if (isDeleteConfirmed) {
            return this.baseEntityService.saveEntity(
              {
                ...this.currentSelectedNode,
                sys_Deactivated: true,
              },
              'student'
            );
          }
          return EMPTY;
        })
      )
      .subscribe({
        next: (result: any) => this.handleDeleteRecord(result),
        error: (err: HttpErrorResponse) => this.handleDeleteError(err),
      });
  }

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
  }

  onFilterTextBoxChanged() {
    this.gridApi.setGridOption(
      'quickFilterText',
      (document.getElementById('filter-text-box') as HTMLInputElement).value
    );
  }

  private openComposeDialog(params: any): void {
    this.dialog.open(StudentMoreInfoDialogComponent, {
      width: '30%',
      maxWidth: '100%',
      enterAnimationDuration: '500ms',
      data: {
        node: params.node?.data,
      },
    });
  }

  private handleDeleteRecord(result: ResponseDto<StudentDto>): void {
    if (!result.succeeded) {
      this.toastr.error(result.responseMessage);
      return;
    }
    this.toastr.success(`Record is deleted successfully!`);
    this.gridApi.applyTransaction({ remove: [this.currentSelectedNode] });
  }

  private handleDeleteError(err: HttpErrorResponse): void {
    this.toastr.error(err.message, err.name);
  }

  private subscribeToEntityData(): void {
    this.baseEntityService
      .getEntityData<StudentInfoDto>('student')
      .pipe(take(1))
      .subscribe({
        next: (result: ResponseDto<StudentInfoDto[]>) => {
          if (result.succeeded) {
            this.rowData = result.data;
            return;
          }
          this.toastr.error(result.responseMessage, `Error in retrieving data`);
        },
        error: (err: HttpErrorResponse) => {
          this.toastr.error(err.message, err.name);
        },
      });
  }

  private setupGridStyles(): void {
    this.gridStyle = {
      width: `${1500}px`,
      height: `${500}px`,
    };
  }

  private setupStudentColumnDefinition = (): void => {
    this.colDefs = [
      { field: 'id', hide: true },
      { field: 'firstName', headerName: 'First Name' },
      { field: 'lastName', headerName: 'Last Name' },
      { field: 'username', headerName: 'Username' },
      { field: 'phoneNumber', headerName: 'Mobile' },
      { field: 'email', headerName: 'Email' },
      { field: 'nicNumber', headerName: 'NIC Number' },
      { field: 'address', headerName: 'Address' },
    ];
  };

  private setupGridOptions(): void {
    this.gridOptions = {
      getRowId: (params: GetRowIdParams<StudentInfoDto>): string =>
        params.data.id,
      context: {
        componentParent: this,
      },
    };
  }
}
