import { Component } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { AbstractPage } from '../abstract-page.component';
import { OnInit } from '@angular/core/src/metadata/lifecycle_hooks';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';

import * as fromRouting from '../../../routing/store';

@Component({
  selector: 'y-product-detail-page',
  templateUrl: './product-detail-page.component.html',
  styleUrls: ['./product-detail-page.component.scss']
})
export class ProductDetailPageComponent implements OnInit {
  productCode;

  constructor(private store: Store<fromRouting.State>) {}

  ngOnInit() {
    this.store
      .select(fromRouting.getRouterState)
      .subscribe(
        routerState =>
          (this.productCode = routerState.state.params['productCode'])
      );
  }
}
