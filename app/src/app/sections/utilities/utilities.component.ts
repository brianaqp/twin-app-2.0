import { Component, inject, OnInit } from '@angular/core';
import { PDFDocument, rgb } from 'pdf-lib';
import { FilesService } from '../../services/files.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-utilities',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './utilities.component.html',
  styleUrls: ['./utilities.component.scss'],
})
export class UtilitiesComponent implements OnInit {
  filename = '';
  year = new Date().getFullYear().toString();

  private readonly filesService = inject(FilesService);

  ngOnInit(): void {
    console.log('utilities on inti');
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    const dropZone = event.currentTarget as HTMLElement;
    dropZone.classList.add('dragover');
  }

  onDragLeave(event: DragEvent) {
    const dropZone = event.currentTarget as HTMLElement;
    dropZone.classList.remove('dragover');
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    const dropZone = event.currentTarget as HTMLElement;
    dropZone.classList.remove('dragover');

    if (event.dataTransfer?.files) {
      const files = event.dataTransfer.files;
      // @ts-ignore
      this.onPDFUpload(files);
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.onPDFUpload(input.files as any);
    }
  }

  async onPDFUpload(files: Array<any>) {
    const file = files[0];
    const arrayBuffer = await file.arrayBuffer();

    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const pages = pdfDoc.getPages();

    pages.forEach((page, idx) => {
      const { width, height } = page.getSize();
      page.drawText(`${idx + 1}`, {
        x: width - 35,
        y: 18,
        size: 10,
        color: rgb(0, 0, 0),
      });
    });

    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = this.filename ? this.filename : file.name;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  // --- Documents download methods
  async onDocumentDownload() {
    this.filesService.getVesselsServed(this.year).subscribe({
      next: (res: Blob) => {
        const blob = res;
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `list.xlsx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {},
    });
  }
}
