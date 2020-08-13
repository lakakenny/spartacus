import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Permission, I18nTestingModule } from '@spartacus/core';
import { Table, TableModule } from '@spartacus/storefront';
import { UrlTestingModule } from 'projects/core/src/routing/configurable-routes/url-translation/testing/url-testing.module';
import { IconTestingModule } from 'projects/storefrontlib/src/cms-components/misc/icon/testing/icon-testing.module';
import { SplitViewTestingModule } from 'projects/storefrontlib/src/shared/components/split-view/testing/spit-view-testing.module';
import { of } from 'rxjs';
import { UserAssignUserGroupsComponent } from './user-assign-user-groups.component';
import { UserAssignUserGroupListService } from './user-assign-user-groups.service';

const userCode = 'userCode';

const mockPermissionList: Table<Permission> = {
  data: [
    {
      code: 'permission-1',
      selected: false,
    },
    {
      code: 'permission-2',
      selected: false,
    },
  ],
  pagination: { totalPages: 1, totalResults: 1, sort: 'byName' },
  structure: { type: '' },
};

class MockActivatedRoute {
  parent = {
    parent: {
      params: of({ code: userCode }),
    },
  };
  snapshot = {};
}

class MockUserPermissionListService {
  getTable(_code) {
    return of(mockPermissionList);
  }
  toggleAssign() {}
}

describe('UserAssignUserGroupsComponent', () => {
  let component: UserAssignUserGroupsComponent;
  let fixture: ComponentFixture<UserAssignUserGroupsComponent>;
  let service: UserAssignUserGroupListService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        I18nTestingModule,
        UrlTestingModule,
        SplitViewTestingModule,
        TableModule,
        IconTestingModule,
      ],
      declarations: [UserAssignUserGroupsComponent],
      providers: [
        { provide: ActivatedRoute, useClass: MockActivatedRoute },
        {
          provide: UserAssignUserGroupListService,
          useClass: MockUserPermissionListService,
        },
      ],
    }).compileComponents();
    service = TestBed.inject(UserAssignUserGroupListService);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserAssignUserGroupsComponent);
    component = fixture.componentInstance;
  });

  // not sure why this is needed, but we're failing otherwise
  afterEach(() => {
    fixture.destroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have users', () => {
    let result;
    component.dataTable$.subscribe((data) => (result = data));
    expect(result).toEqual(mockPermissionList);
  });

  it('should get users from service by code', () => {
    spyOn(service, 'getTable');
    fixture.detectChanges();
    expect(service.getTable).toHaveBeenCalled();
  });

  describe('with table data', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });
    it('should have cx-table element', () => {
      const el = fixture.debugElement.query(By.css('cx-table'));
      expect(el).toBeTruthy();
    });
    it('should not show is-empty message', () => {
      const el = fixture.debugElement.query(By.css('p.is-empty'));
      expect(el).toBeFalsy();
    });

    it('should assign a user', () => {
      spyOn(service, 'toggleAssign');
      component.toggleAssign('userCode', 'permission-1', true);
      expect(service.toggleAssign).toHaveBeenCalledWith(
        'userCode',
        'permission-1',
        true
      );
    });

    it('should unassign a permission', () => {
      spyOn(service, 'toggleAssign');
      component.toggleAssign('userCode', 'permission-1', false);
      expect(service.toggleAssign).toHaveBeenCalledWith(
        'userCode',
        'permission-1',
        false
      );
    });
  });

  describe('without table data', () => {
    beforeEach(() => {
      spyOn(service, 'getTable').and.returnValue(of(null));
      fixture.detectChanges();
    });
    it('should not have cx-table element', () => {
      const el = fixture.debugElement.query(By.css('cx-table'));
      expect(el).toBeFalsy();
    });
    it('should not show is-empty message', () => {
      const el = fixture.debugElement.query(By.css('p.is-empty'));
      expect(el).toBeTruthy();
    });
  });
});