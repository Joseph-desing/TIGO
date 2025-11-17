import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DetallePlanPage } from './detalle-plan.page';

describe('DetallePlanPage', () => {
  let component: DetallePlanPage;
  let fixture: ComponentFixture<DetallePlanPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DetallePlanPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
