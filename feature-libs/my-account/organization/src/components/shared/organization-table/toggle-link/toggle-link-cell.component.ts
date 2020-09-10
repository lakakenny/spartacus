import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostBinding,
  Output,
} from '@angular/core';
import {
  OutletContextData,
  TableDataOutletContext,
} from '@spartacus/storefront';
import { UnitListService } from '../../../unit/services/unit-list.service';
import { OrganizationCellComponent } from '../organization-cell.component';

@Component({
  template: `
    <button class="button action">
      <ng-container *ngIf="count > 0">
        <cx-icon
          *ngIf="expanded; else showExpand"
          type="CARET_RIGHT"
          (click)="toggleItem($event)"
        ></cx-icon>
        <ng-template #showExpand>
          <cx-icon type="CARET_DOWN" (click)="toggleItem($event)"></cx-icon>
        </ng-template>
      </ng-container>
    </button>
    <a
      [routerLink]="{ cxRoute: route, params: routeModel } | cxUrl"
      [tabIndex]="tabIndex"
    >
      <span class="text">{{ property }} ({{ count }})</span>
    </a>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToggleLinkCellComponent extends OrganizationCellComponent {
  @HostBinding('style.--cx-nest-level')
  nestLevel = this.model.level;

  @Output() switch = new EventEmitter();

  constructor(
    protected outlet: OutletContextData<TableDataOutletContext>,
    protected uls: UnitListService
  ) {
    super(outlet);
  }

  get tabIndex() {
    return 1;
  }

  get expanded() {
    return this.model.expanded;
  }

  get level() {
    return this.model.level;
  }

  get count() {
    return this.model.count;
  }

  toggleItem(event: Event) {
    this.uls.toggle(event);
    // this.model.expanded = !this.model.expanded;
    // event.stopPropagation();
    // this.switch.emit(event);
  }
}
