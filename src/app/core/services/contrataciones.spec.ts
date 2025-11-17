import { TestBed } from '@angular/core/testing';

import { Contrataciones } from './contrataciones';

describe('Contrataciones', () => {
  let service: Contrataciones;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Contrataciones);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
