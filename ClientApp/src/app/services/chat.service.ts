import { Injectable, EventEmitter } from '@angular/core';
import { HubConnection, HubConnectionBuilder } from '@aspnet/signalr';
import { MessageExt, PublicKeyExt, InitConversationInfo, PublicKeyRequestExt } from '../app.model';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class ChatService {
  conversationStarted = new EventEmitter<InitConversationInfo>();
  messageReceived = new EventEmitter<MessageExt>();
  publickKeyReceived = new EventEmitter<PublicKeyExt>();
  publickKeyRequested = new EventEmitter<PublicKeyRequestExt>();
  userListReceived = new EventEmitter<Array<string>>();
  connectionEstablished = new EventEmitter<boolean>();
  isConnectionEstablished = false;

  private hubConnection: HubConnection;

  constructor() {
    this.createConnection();
    this.registerOnServerEvents();
    this.startConnection();
  }

  init(user: string) {
    this.hubConnection.invoke('Init', user);
  }

  startConversation(fromUser: string, toUser: string) {
    this.hubConnection.invoke('StartCoversation', fromUser, toUser);
  }

  sendMessage(fromUser: string, toUser: string, message: string) {
    this.hubConnection.invoke('SendMessage', fromUser, toUser, message);
  }

  sendPublicKey(fromUser: string, toUser: string, publicKey: string) {
    this.hubConnection.invoke('SendPublicKey', fromUser, toUser, publicKey);
  }

  private createConnection() {
    this.hubConnection = new HubConnectionBuilder()
      .withUrl(`${environment.api}/chathub`)
      .build();
  }

  private startConnection(): void {
    this.hubConnection
      .start()
      .then(() => {
        this.isConnectionEstablished = true;
        this.connectionEstablished.emit(true);
      })
      .catch(err => {
        setTimeout(() => { this.startConnection(); }, 5000);
      });
  }

  private registerOnServerEvents(): void {
    this.hubConnection.on('StartedConversation', (fromUser: string, toUser: string) => {
      this.conversationStarted.emit({ fromUser, toUser });
    });
    this.hubConnection.on('ReceiveMessage', (fromUser: string, toUser: string, message: string) => {
      this.messageReceived.emit({ fromUser, toUser, message });
    });
    this.hubConnection.on('RequestedPublicKey', (fromUser: string, toUser: string) => {
      this.publickKeyRequested.emit({ fromUser, toUser });
    });
    this.hubConnection.on('ReceivePublicKey', (fromUser: string, toUser: string, publicKey: string) => {
      this.publickKeyReceived.emit({ fromUser, toUser, publicKey });
    });
    this.hubConnection.on('ListUsers', (users: Array<string>) => {
      this.userListReceived.emit(users);
    });
  }
}
