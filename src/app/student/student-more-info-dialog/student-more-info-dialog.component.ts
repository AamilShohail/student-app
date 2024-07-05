import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { StudentInfoDto } from '@app/dtos/student-response.dto';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-student-more-info-dialog',
  standalone: true,
  imports: [MatDividerModule],
  templateUrl: './student-more-info-dialog.component.html',
  styleUrl: './student-more-info-dialog.component.scss',
})
export class StudentMoreInfoDialogComponent {
  info!: StudentInfoDto;
  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: any
  ) {
    this.info = data.node;
  }
}
