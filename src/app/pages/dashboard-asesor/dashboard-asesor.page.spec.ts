import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardAsesorPage } from './dashboard-asesor.page';

describe('DashboardAsesorPage', () => {
  let component: DashboardAsesorPage;
  let fixture: ComponentFixture<DashboardAsesorPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardAsesorPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
