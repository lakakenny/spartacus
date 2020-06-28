import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, queueScheduler } from 'rxjs';
import { filter, map, observeOn, take, tap } from 'rxjs/operators';
import { AuthService } from '../../auth/facade/auth.service';
import { EntitiesModel } from '../../model/misc.model';
import {
  OrderApprovalPermissionType,
  Permission,
} from '../../model/permission.model';
import { StateWithProcess } from '../../process/store/process-state';
import { LoaderState } from '../../state/utils/loader/loader-state';
import { B2BSearchConfig } from '../model/search-config';
import { PermissionActions } from '../store/actions/index';
import { StateWithOrganization } from '../store/organization-state';

import {
  getPermissionList,
  getPermission,
  getPermissionTypes,
} from '../store/selectors/permission.selector';

@Injectable()
export class PermissionService {
  constructor(
    protected store: Store<StateWithOrganization | StateWithProcess<void>>,
    protected authService: AuthService
  ) {}

  loadPermission(permissionCode: string): void {
    this.withUserId((userId) =>
      this.store.dispatch(
        new PermissionActions.LoadPermission({
          userId,
          permissionCode,
        })
      )
    );
  }

  loadPermissions(params?: B2BSearchConfig): void {
    this.withUserId((userId) =>
      this.store.dispatch(
        new PermissionActions.LoadPermissions({ userId, params })
      )
    );
  }

  loadPermissionTypes() {
    this.store.dispatch(new PermissionActions.LoadPermissionTypes());
  }

  private getPermission(
    permissionCode: string
  ): Observable<LoaderState<Permission>> {
    return this.store.select(getPermission(permissionCode));
  }

  private getPermissionList(
    params
  ): Observable<LoaderState<EntitiesModel<Permission>>> {
    return this.store.select(getPermissionList(params));
  }

  private getPermissionTypeList(): Observable<
    LoaderState<OrderApprovalPermissionType[]>
  > {
    return this.store.select(getPermissionTypes());
  }

  get(permissionCode: string): Observable<Permission> {
    return this.getPermission(permissionCode).pipe(
      observeOn(queueScheduler),
      tap((state) => {
        if (!(state.loading || state.success || state.error)) {
          this.loadPermission(permissionCode);
        }
      }),
      filter((state) => state.success || state.error),
      map((state) => state.value)
    );
  }

  getTypes(): Observable<OrderApprovalPermissionType[]> {
    return this.getPermissionTypeList().pipe(
      observeOn(queueScheduler),
      tap((process: LoaderState<OrderApprovalPermissionType[]>) => {
        if (!(process.loading || process.success || process.error)) {
          this.loadPermissionTypes();
        }
      }),
      filter(
        (process: LoaderState<OrderApprovalPermissionType[]>) =>
          process.success || process.error
      ),
      map((result) => result.value)
    );
  }

  getList(params: B2BSearchConfig): Observable<EntitiesModel<Permission>> {
    return this.getPermissionList(params).pipe(
      observeOn(queueScheduler),
      tap((process: LoaderState<EntitiesModel<Permission>>) => {
        if (!(process.loading || process.success || process.error)) {
          this.loadPermissions(params);
        }
      }),
      filter(
        (process: LoaderState<EntitiesModel<Permission>>) =>
          process.success || process.error
      ),
      map((result) => result.value)
    );
  }

  create(permission: Permission): void {
    this.withUserId((userId) =>
      this.store.dispatch(
        new PermissionActions.CreatePermission({ userId, permission })
      )
    );
  }

  update(permissionCode: string, permission: Permission): void {
    this.withUserId((userId) =>
      this.store.dispatch(
        new PermissionActions.UpdatePermission({
          userId,
          permissionCode,
          permission,
        })
      )
    );
  }

  private withUserId(callback: (userId: string) => void): void {
    this.authService
      .getOccUserId()
      .pipe(take(1))
      .subscribe((userId) => callback(userId));
  }
}