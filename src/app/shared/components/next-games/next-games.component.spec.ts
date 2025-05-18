import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NextGamesComponent } from './next-games.component';

describe('NextWeekGamesComponent', () => {
  let component: NextGamesComponent;
  let fixture: ComponentFixture<NextGamesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NextGamesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NextGamesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
