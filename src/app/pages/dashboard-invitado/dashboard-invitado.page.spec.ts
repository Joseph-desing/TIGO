import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardInvitadoPage } from './dashboard-invitado.page';

describe('DashboardInvitadoPage', () => {
  let component: DashboardInvitadoPage;
  let fixture: ComponentFixture<DashboardInvitadoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardInvitadoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
