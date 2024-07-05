import { Component } from '@angular/core';
import { StudentGridComponent } from './student/student-grid/student-grid.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [StudentGridComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'student-app';
}
