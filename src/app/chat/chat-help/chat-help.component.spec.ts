import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatHelpComponent } from './chat-help.component';

describe('ChatHelpComponent', () => {
  let component: ChatHelpComponent;
  let fixture: ComponentFixture<ChatHelpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatHelpComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ChatHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
