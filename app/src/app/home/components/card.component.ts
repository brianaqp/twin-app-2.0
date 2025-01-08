import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
  ElementRef,
  input,
  signal,
  Signal,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NgbDropdownModule],
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
})
export class RegisterCardComponent {
  @ViewChild('input') input!: ElementRef<HTMLInputElement>;
  // Signals
  collection: Signal<'registers' | 'vessels'> = input('registers');
  list = input<{
    registers: Array<any>;
    vessels: Array<any>;
  }>({
    registers: [],
    vessels: [],
  });
  searchType = 'name';
  selection = '';
  busqueda = signal('');

  // Computed properties
  displayedList = computed(() => {
    // Current signals
    const list = this.list();
    const collection = this.collection();

    const values = list[collection];

    if (this.busqueda() === '') {
      return values;
    } else {
      return values.filter((item) => {
        return item[this.searchType]
          .trim()
          .toLowerCase()
          .includes(this.busqueda().trim().toLowerCase());
      });
    }
  });

  onSearch(event: any) {
    this.busqueda.set(event.target.value);
  }

  // Metodo que se ejecuta cuando se selecciona un elemento del dropdown, y cambiar el tipo de busqueda
  onSearchTypeChange(newType: string): void {
    if (this.searchType !== newType) this.searchType = newType;
    this.input.nativeElement.focus();
  }
}
