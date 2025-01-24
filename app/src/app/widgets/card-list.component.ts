import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-card-list',
  template: `
    <div class="card border border-0">
      <ul class="list-group">
        @for (item of itemList(); track $index) {
          <a
            class="list-group-item list-group-item-action fs-6"
            (click)="itemClicked.emit()"
          >
            {{ item.id }} | {{ item.name }}
          </a>
        } @empty {
          <a class="list-group-item list-group-item-action fs-6"
            >No hay datos que mostrar
          </a>
        }
      </ul>
    </div>
  `,
  styles: 
  `
@media (max-width: 768px) {
  a {
    font-size: 1.1em !important;
    padding: 0.9em;
  }
}
`
})
export class CardListComponent {
    itemList = input<Array<any>>([])
    itemClicked = output<void>({ alias: 'onItemClicked' })
}
