import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import {
  NbThemeModule,
  NbLayoutModule,
  NbListModule,
  NbUserModule,
  NbCardModule,
  NbSidebarModule,
  NbButtonModule,
  NbInputModule,
  NbChatModule,
  
} from '@nebular/theme';
import { ChatService } from './services/chat.service';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    AppRoutingModule,
    NoopAnimationsModule,
    NbThemeModule.forRoot({ name: 'cosmic' }),
    NbLayoutModule,
    NbListModule,
    NbUserModule,
    NbCardModule,
    NbSidebarModule.forRoot(),
    NbButtonModule,
    NbInputModule,
    NbChatModule
  ],
  providers: [ChatService],
  bootstrap: [AppComponent]
})
export class AppModule { }
