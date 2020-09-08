import { Type } from '@angular/core';
import { async, TestBed } from '@angular/core/testing';
import { Store, StoreModule } from '@ngrx/store';
import { of } from 'rxjs';
import { StateWithConfigurator } from '../state/configurator-state';
import {
  GROUP_ID_1,
  GROUP_ID_3,
  GROUP_ID_4,
  GROUP_ID_5,
  GROUP_ID_6,
  GROUP_ID_7,
  GROUP_ID_8,
  productConfiguration,
  productConfigurationWithConflicts,
} from './../../shared/testing/configuration-test-data';
import { ConfiguratorActions } from './../state/actions/index';
import { ConfiguratorGroupStatusService } from './configurator-group-status.service';
import { ConfiguratorUtilsService } from './utils/configurator-utils.service';

describe('ConfiguratorGroupStatusService', () => {
  let classUnderTest: ConfiguratorGroupStatusService;
  let store: Store<StateWithConfigurator>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [StoreModule.forRoot({})],
      providers: [ConfiguratorUtilsService, ConfiguratorGroupStatusService],
    }).compileComponents();
  }));

  beforeEach(() => {
    classUnderTest = TestBed.inject(
      ConfiguratorGroupStatusService as Type<ConfiguratorGroupStatusService>
    );
    store = TestBed.inject(Store as Type<Store<StateWithConfigurator>>);

    spyOn(store, 'dispatch').and.stub();
    spyOn(store, 'pipe').and.returnValue(of(productConfiguration));
  });

  it('should be created', () => {
    expect(classUnderTest).toBeTruthy();
  });

  describe('Group Status Tests', () => {
    it('should call setGroupVisisted action on setGroupStatus method call', () => {
      classUnderTest.setGroupStatus(
        productConfiguration,
        productConfiguration.groups[0].id,
        true
      );

      const expectedAction = new ConfiguratorActions.SetGroupsVisited({
        entityKey: productConfiguration.owner.key,
        visitedGroups: [GROUP_ID_1],
      });

      expect(store.dispatch).toHaveBeenCalledWith(expectedAction);
    });

    it('should get parent group, when all subgroups are visited', () => {
      spyOn(store, 'select').and.returnValue(of(true));
      classUnderTest.setGroupStatus(productConfiguration, GROUP_ID_4, true);

      const expectedAction = new ConfiguratorActions.SetGroupsVisited({
        entityKey: productConfiguration.owner.key,
        visitedGroups: [GROUP_ID_4, GROUP_ID_3],
      });

      expect(store.dispatch).toHaveBeenCalledWith(expectedAction);
    });

    it('should not get parent group, when not all subgroups are visited', () => {
      //Not all subgroups are visited
      spyOn(store, 'select').and.returnValue(of(false));

      classUnderTest.setGroupStatus(productConfiguration, GROUP_ID_6, true);

      const expectedAction = new ConfiguratorActions.SetGroupsVisited({
        entityKey: productConfiguration.owner.key,
        visitedGroups: [GROUP_ID_6],
      });

      expect(store.dispatch).toHaveBeenCalledWith(expectedAction);
    });

    it('should get all parent groups, when lowest subgroup are visited', () => {
      spyOn(store, 'select').and.returnValue(of(true));

      classUnderTest.setGroupStatus(productConfiguration, GROUP_ID_8, true);

      const expectedAction = new ConfiguratorActions.SetGroupsVisited({
        entityKey: productConfiguration.owner.key,
        visitedGroups: [GROUP_ID_8, GROUP_ID_7, GROUP_ID_5],
      });

      expect(store.dispatch).toHaveBeenCalledWith(expectedAction);
    });

    it('should get first incomplete group', () => {
      expect(classUnderTest.getFirstIncompleteGroup(productConfiguration)).toBe(
        productConfiguration.flatGroups[0]
      );
    });

    it('should get first incomplete group - only consider non conflict groups', () => {
      expect(
        classUnderTest.getFirstIncompleteGroup(
          productConfigurationWithConflicts
        )
      ).toBe(productConfigurationWithConflicts.flatGroups[3]);
    });

    it('should return status completed if required fields are filled for different groups', () => {
      // required checkbox not filled
      expect(
        classUnderTest.checkIsGroupComplete(productConfiguration.groups[0])
      ).toBe(false);
      //no required attributes in group
      expect(
        classUnderTest.checkIsGroupComplete(productConfiguration.groups[1])
      ).toBe(true);
      //two required attributes, only one is filled
      expect(
        classUnderTest.checkIsGroupComplete(
          productConfiguration.groups[2].subGroups[0]
        )
      ).toBe(false);
      //required single selection image not filled
      expect(
        classUnderTest.checkIsGroupComplete(
          productConfiguration.groups[3].subGroups[0]
        )
      ).toBe(false);
      //has a conflict
      expect(
        classUnderTest.checkIsGroupComplete(
          productConfigurationWithConflicts.groups[5].subGroups[0]
        )
      ).toBe(false);
    });
  });
});
