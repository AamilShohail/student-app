import {
  Directive,
  ElementRef,
  Input,
  OnChanges,
  SecurityContext,
  SimpleChanges,
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Directive({
  selector: 'img[imgPreview]',
  standalone: true,
})
export class ImageFilePreviewDirective implements OnChanges {
  @Input() public imageSrc: any;

  constructor(
    private elementRef: ElementRef,
    private sanitizer: DomSanitizer
  ) {}

  public ngOnChanges(_changes: SimpleChanges): void {
    const reader: FileReader = new FileReader();
    const imgElementRef: ElementRef<any> = this.elementRef;

    reader.onloadend = () => {
      const image: HTMLImageElement = new Image();
      image.onload = () => {
        const canvas: HTMLCanvasElement = document.createElement('canvas');
        const dxCoordinate = 0;
        const dyCoordinate = 0;
        canvas.width = 217;
        canvas.height = 169;
        canvas.style.padding = '6px';
        canvas.style.justifyContent = 'center';
        canvas.style.alignItems = 'center';
        canvas.style.gap = '10px';
        canvas
          .getContext('2d')
          ?.drawImage(
            image,
            dxCoordinate,
            dyCoordinate,
            canvas.width,
            canvas.height
          );
        imgElementRef.nativeElement.src = canvas.toDataURL('image/jpeg');
      };
      image.src = this.sanitizer.sanitize(
        SecurityContext.RESOURCE_URL,
        this.sanitizer.bypassSecurityTrustResourceUrl(reader.result as string)
      ) as string;
    };

    if (this.imageSrc) {
      reader.readAsDataURL(this.imageSrc);
    }
  }
}
