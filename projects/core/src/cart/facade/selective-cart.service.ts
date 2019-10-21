import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { StateWithMultiCart } from '../store/multi-cart-state';
import { MultiCartService } from './multi-cart.service';
import { UserService } from '../../user/facade/user.service';
import { AuthService } from '../../auth/facade/auth.service';
import { OCC_USER_ID_CURRENT, OCC_USER_ID_ANONYMOUS } from '../../occ';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { Cart } from '../../model/cart.model';
import { LoaderState } from '../../state/utils/loader/loader-state';
import { map, filter, tap, shareReplay, switchMap, take } from 'rxjs/operators';
import { OrderEntry } from '../../model/order.model';

@Injectable()
export class SelectiveCartService {
  _customerId: string;
  _userId: string;
  _cartId: string;
  _selectiveCart$: Observable<Cart>;
  cartId$: BehaviorSubject<string> = new BehaviorSubject<string>(undefined);

  private readonly PREVIOUS_USER_ID_INITIAL_VALUE =
    'PREVIOUS_USER_ID_INITIAL_VALUE';
  private previousUserId = this.PREVIOUS_USER_ID_INITIAL_VALUE;

  private cartSelector = this.cartId$.pipe(
    switchMap(cartId => {
      this._cartId = cartId;
      return this.multiCartService.getCartEntity(cartId);
    })
  );

  constructor(
    protected store: Store<StateWithMultiCart>,
    protected userService: UserService,
    protected authService: AuthService,
    protected multiCartService: MultiCartService
  ) {
    this.userService.get().subscribe(user => {
      if (user && user.customerId) {
        this._customerId = user.customerId;
        this.cartId$.next(`selectivecart${this._customerId}`);
      }
    });

    this.authService.getOccUserId().subscribe(userId => {
      this._userId = userId;
      if (this._userId !== OCC_USER_ID_ANONYMOUS) {
        if (this.isJustLoggedIn(userId)) {
          this.load();
        }
      }
      this.previousUserId = userId;
    });

    this._selectiveCart$ = this.cartSelector.pipe(
      map((cartEntity: LoaderState<Cart>): {
        cart: Cart;
        loading: boolean;
        loaded: boolean;
      } => {
        return {
          cart: cartEntity.value,
          loading: cartEntity.loading,
          loaded:
            (cartEntity.error || cartEntity.success) && !cartEntity.loading,
        };
      }),
      filter(({ loading }) => !loading),
      tap(({ cart, loaded }) => {
        if (this._cartId && this.isEmpty(cart) && !loaded) {
          this.load();
        }
      }),
      map(({ cart }) => (cart ? cart : {})),
      shareReplay({ bufferSize: 1, refCount: true })
    );
  }

  getCart(): Observable<Cart> {
    return this._selectiveCart$;
  }

  getEntries(): Observable<OrderEntry[]> {
    return this.multiCartService.getEntries(this._cartId);
  }

  getLoaded(): Observable<boolean> {
    return this.cartSelector.pipe(
      map(cart => (cart.success || cart.error) && !cart.loading)
    );
  }

  private load() {
    this.multiCartService.loadCart({
      userId: this._userId,
      cartId: this._cartId,
    });
  }

  addEntry(productCode: string, quantity: number): void {
    let createInitialized = false;
    this.cartSelector
      .pipe(
        filter(() => !createInitialized),
        switchMap(cartState => {
          if (this.isEmpty(cartState.value) && !cartState.loading) {
            createInitialized = true;
            this.load();
          }
          return of(cartState);
        }),
        filter(cartState => !this.isEmpty(cartState.value)),
        take(1)
      )
      .subscribe(_ => {
        this.multiCartService.addEntry(
          this._userId,
          this._cartId,
          productCode,
          quantity
        );
      });
  }

  removeEntry(entry: OrderEntry): void {
    this.multiCartService.removeEntry(
      this._userId,
      this._cartId,
      entry.entryNumber
    );
  }

  updateEntry(entryNumber: number, quantity: number): void {
    this.multiCartService.updateEntry(
      this._userId,
      this._cartId,
      entryNumber,
      quantity
    );
  }

  getEntry(productCode: string): Observable<OrderEntry> {
    return this.multiCartService.getEntry(this._cartId, productCode);
  }

  private isEmpty(cart: Cart): boolean {
    return (
      !cart || (typeof cart === 'object' && Object.keys(cart).length === 0)
    );
  }

  private isJustLoggedIn(userId: string): boolean {
    return (
      this.isLoggedIn(userId) &&
      this.previousUserId !== userId && // *just* logged in
      this.previousUserId !== this.PREVIOUS_USER_ID_INITIAL_VALUE // not app initialization
    );
  }

  private isLoggedIn(userId: string): boolean {
    return typeof userId !== 'undefined';
  }
}
