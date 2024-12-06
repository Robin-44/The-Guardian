import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PosologyListComponent } from './posology-list.component';

describe('PosologyListComponent', () => {
  let component: PosologyListComponent;
  let fixture: ComponentFixture<PosologyListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PosologyListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PosologyListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
