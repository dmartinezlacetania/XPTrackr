import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NextWeekGamesComponent } from './next-week-games.component';

describe('NextWeekGamesComponent', () => {
  let component: NextWeekGamesComponent;
  let fixture: ComponentFixture<NextWeekGamesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NextWeekGamesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NextWeekGamesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
