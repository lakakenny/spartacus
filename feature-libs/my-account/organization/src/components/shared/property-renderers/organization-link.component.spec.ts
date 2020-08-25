import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { I18nTestingModule, UrlModule } from '@spartacus/core';
import { OutletContextData } from '@spartacus/storefront';
import { OrganizationLinkComponent } from './organization-link.component';

const mockContext = {
  _field: 'name',
  _type: 'myType',
  name: 'my name',
  code: 'my code',
};

describe('OrganizationLinkComponent', () => {
  let component: OrganizationLinkComponent;
  let fixture: ComponentFixture<OrganizationLinkComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [OrganizationLinkComponent],
      imports: [RouterTestingModule, UrlModule, I18nTestingModule],
      providers: [
        {
          provide: OutletContextData,
          useValue: {
            context: mockContext,
          },
        },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OrganizationLinkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should resolve property', () => {
    expect(component.property).toEqual('my name');
  });

  it('should resolve model', () => {
    expect(component.model).toEqual(mockContext);
  });

  it('should resolve route', () => {
    expect(component.route).toEqual('myTypeDetails');
  });

  it('should resolve route model', () => {
    expect(component.routeModel).toEqual(mockContext);
  });

  it('should render link', () => {
    const el: HTMLElement = fixture.debugElement.query(By.css('a')).nativeNode;
    expect(el).toBeTruthy();
  });

  it('should render text', () => {
    const el: HTMLElement = fixture.debugElement.query(By.css('span.text'))
      .nativeNode;
    expect(el.innerText).toEqual('my name');
  });
});