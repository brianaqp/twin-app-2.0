import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
  ElementRef,
  input,
  OnChanges,
  OnInit,
  Signal,
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
  busqueda: string = '';

  // Computed properties
  displayedList = computed(() => {
    const list = this.list();
    const collection = this.collection();
    return list[collection];
  });

  ngOnInit(): void {
    console.log('card init', this.list());
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['collection'] && this.collection != undefined) {
    }
  }

  // Metodo que se ejecuta cuando se selecciona un elemento del dropdown, y cambiar el tipo de busqueda
  onSearchTypeChange(newType: string): void {
    if (this.searchType !== newType) this.searchType = newType;
    this.input.nativeElement.focus();
  }
}
