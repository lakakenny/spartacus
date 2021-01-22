import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { normalizeHttpError } from '@spartacus/core';
import { Observable, of } from 'rxjs';
import { catchError, concatMap, map } from 'rxjs/operators';
import { UserProfileConnector } from '../../connectors/user-profile.connector';
import { UserActions } from '../actions/index';

@Injectable()
export class UpdatePasswordEffects {
  constructor(
    private actions$: Actions,
    private userAccountConnector: UserProfileConnector
  ) {}

  @Effect()
  updatePassword$: Observable<
    UserActions.UpdatePasswordSuccess | UserActions.UpdatePasswordFail
  > = this.actions$.pipe(
    ofType(UserActions.UPDATE_PASSWORD),
    map((action: UserActions.UpdatePassword) => action.payload),
    concatMap((payload) =>
      this.userAccountConnector
        .updatePassword(
          payload.userId,
          payload.oldPassword,
          payload.newPassword
        )
        .pipe(
          map(() => new UserActions.UpdatePasswordSuccess()),
          catchError((error) =>
            of(new UserActions.UpdatePasswordFail(normalizeHttpError(error)))
          )
        )
    )
  );
}