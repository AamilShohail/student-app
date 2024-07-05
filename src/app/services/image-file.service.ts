import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ImageFileService {
  selectedImageFile$ = new Subject<File>();
}
