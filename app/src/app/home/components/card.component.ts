import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
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
export class RegisterCardComponent implements OnChanges, OnInit {
  @ViewChild('input') input!: ElementRef<HTMLInputElement>;
  @Input() collection!: any;
  @Input() list!: {
    registers: Array<any>;
    vessels: Array<any>;
  };
  searchType = 'name';
  selection = '';
  busqueda: string = '';

  ngOnInit(): void {
    console.log('card init');
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['collection'] && this.collection != undefined) {
      console.log('/// change in values');
    }
  }

  // Metodo que se ejecuta cuando se selecciona un elemento del dropdown, y cambiar el tipo de busqueda
  onSearchTypeChange(newType: string): void {
    if (this.searchType !== newType) this.searchType = newType;
    this.input.nativeElement.focus();
  }
}
