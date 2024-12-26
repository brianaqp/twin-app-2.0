import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  Input,
  OnChanges,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
})
export class RegisterCardComponent implements OnChanges {
  @ViewChild('input') input!: ElementRef<HTMLInputElement>;
  @Input() collection!: any;
  @Input() list!: object[];
  searchType = 'name';
  selection = '';
  busqueda: string = '';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['collection'] && this.collection != undefined) {
      console.log('///');
    }
  }

  // Metodo que se ejecuta cuando se selecciona un elemento del dropdown, y cambiar el tipo de busqueda
  onSearchTypeChange(newType: string): void {
    if (this.searchType !== newType) this.searchType = newType;
    this.input.nativeElement.focus();
  }

  filtrarLista(): Array<any> {
    if (this.busqueda === '') {
      return [];
    } else {
      // Revisar todo!
      return this.list;
      // return this.list[this.collection.toLowerCase()].filter((item: any) => {
      //   return item[this.searchType]
      //     .trim()
      //     .toLowerCase()
      //     .includes(this.busqueda.trim().toLowerCase());
      // });
    }
  }
}
