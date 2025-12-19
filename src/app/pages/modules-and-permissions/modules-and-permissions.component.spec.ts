import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModulesAndPermissionsComponent } from './modules-and-permissions.component';

describe('ModulesAndPermissionsComponent', () => {
  let component: ModulesAndPermissionsComponent;
  let fixture: ComponentFixture<ModulesAndPermissionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModulesAndPermissionsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModulesAndPermissionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
