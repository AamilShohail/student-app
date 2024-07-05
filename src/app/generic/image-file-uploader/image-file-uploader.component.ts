import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ImageFilePreviewDirective } from '@app/directives/image-file-preview.directive';
import { ImageFileService } from '@app/services/image-file.service';

@Component({
  selector: 'app-image-file-uploader',
  standalone: true,
  imports: [
    MatButtonModule,
    ImageFilePreviewDirective,
    MatIconModule,
    CommonModule,
  ],
  templateUrl: './image-file-uploader.component.html',
  styleUrl: './image-file-uploader.component.scss',
})
export class ImageFileUploaderComponent {
  imgUrl!: File | null;
  acceptedImageFileTypes: string[] = [
    'image/png',
    'image/jpeg',
    'image/svg',
    'image/jpg',
  ];

  @ViewChild('fileUpload') public fileUpload!: ElementRef;

  constructor(private imageFileService: ImageFileService) {}

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];

    if (file) {
      this.imgUrl = file;
    }
    this.imageFileService.selectedImageFile$.next(file);
  }

  removeImageFile(): void {
    this.imgUrl = null;
  }

  editImageFile(): void {
    this.fileUpload.nativeElement.click();
  }
}
