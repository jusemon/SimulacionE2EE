import { Component, OnInit, OnDestroy } from '@angular/core';
import { Conversation, UserKey } from './app.model';
import { ChatService } from './services/chat.service';
import { tap, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import * as cryptico from 'cryptico-js/dist/cryptico.browser.js';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  user: string;
  isUserSelected = false;
  conversations: Array<Conversation> = [];
  publicUserKeys: Array<UserKey> = [];
  selectedConversation: Conversation = null;

  publicKey: string = null;
  private privateKey: string = null;

  private destroy$ = new Subject();
  users: Array<{ name: string; picture: string; }>;

  // tslint:disable-next-line: max-line-length
  userNames: Array<string> = ['Lang', 'Mariana', 'Regina', 'Armand', 'Sherman', 'Celina', 'Vincent', 'Lori', 'Devin', 'January', 'Valerie', 'Yelena', 'Frieda', 'Eugene', 'Nidia', 'Emily', 'Randell', 'Samella', 'Deloris', 'Marvin', 'Ty', 'Layla', 'Erline', 'Kelli', 'Chun', 'Tosha', 'Yasmin', 'Scarlett', 'Cyrus', 'Cornelia', 'Mireya', 'Sadie', 'Velia', 'Terrance', 'Virgen', 'Susann', 'Robbie', 'Latashia', 'Brooke', 'Claribel', 'Mikki', 'Gail', 'Summer', 'Rena', 'Daine', 'Tammara', 'Lupita', 'Takisha', 'Rochel', 'Evelin']

  constructor(private chatService: ChatService) { }

  ngOnInit() {
    const passPhrase = Math.random().toString(36).slice(2);
    this.privateKey = cryptico.generateRSAKey(passPhrase, 1024);
    this.publicKey = cryptico.publicKeyString(this.privateKey);
    this.user = this.userNames[parseInt(`${Math.random() * 50}`, 10)];
    setTimeout(() => this.initChat(), 1000);
  }

  initChat() {
    if (this.chatService.isConnectionEstablished) {

      // Se inicia una conversación entre otro usuario y este
      this.chatService.conversationStarted.pipe(
        takeUntil(this.destroy$),
        tap((data) => {
          if (this.conversations.some(c => c.user !== data.fromUser)) {
            return;
          }
          this.conversations.push({
            user: data.fromUser,
            messages: []
          });
          this.onSelectConversation(this.conversations[this.conversations.length - 1]);
        })
      ).subscribe();

      // Obtengo la lista de usuarios
      this.chatService.userListReceived.pipe(
        takeUntil(this.destroy$),
        tap((users) => {
          this.users = users.filter(user => user !== this.user).map(user => ({ name: user, picture: this.getPic(user) }));
        })
      ).subscribe();

      // Recibimos los mensajes, si ya existe una conversación agregamos el mensaje a la conversación
      this.chatService.messageReceived.pipe(
        takeUntil(this.destroy$),
        tap((data) => {
          if (this.conversations.every(c => c.user !== data.fromUser)) {
            return;
          }

          // Deciframos el mensaje con la clave privada
          const message = cryptico.decrypt(data.message, this.privateKey);
          const conversation = this.conversations.find(c => c.user === data.fromUser);
          conversation.messages.push({
            date: new Date(),
            reply: false,
            text: message.plaintext,
            type: 'text',
            user: {
              name: data.fromUser,
              avatar: this.getPic(data.fromUser)
            }
          });
        })
      ).subscribe();

      // Si el otro usuario solicita la clave pública la enviamos
      this.chatService.publickKeyRequested.pipe(
        takeUntil(this.destroy$),
        tap((user) => {
          this.chatService.sendPublicKey(this.user, user.fromUser, this.publicKey);
        })
      ).subscribe();

      // Si solicitamos previamente la clave pública de otro usuario aquí la recibimos
      this.chatService.publickKeyReceived.pipe(
        takeUntil(this.destroy$),
        tap((data) => {
          let userKey = this.publicUserKeys.find(u => data.fromUser === u.user);
          if (!userKey) {
            userKey = {
              key: data.publicKey,
              user: data.fromUser
            };
            this.publicUserKeys.push(userKey);
          } else {
            userKey.key = data.publicKey;
          }
        })
      ).subscribe();

      this.chatService.init(this.user);
    } else {
      this.chatService.connectionEstablished.pipe(
        takeUntil(this.destroy$),
        tap(isConnected => {
          if (isConnected) {
            this.initChat();
          }
        }));
    }
  }

  onSelectConversation(conversation: Conversation) {
    this.selectedConversation = conversation;
  }

  onStartConversation(toUser: string) {
    this.chatService.startConversation(this.user, toUser);
  }

  onSendMessage(obj: { message: string }) {
    const { message } = obj;
    console.log('Debug: onSendMessage', { message });
    this.selectedConversation.messages.push({
      date: new Date(),
      reply: true,
      text: message,
      type: 'text',
      user: {
        name: this.user,
        avatar: this.getPic(this.user)
      }
    });
    // Ciframos el mensaje con la clave pública del destinatario
    const securedMessage = cryptico.encrypt(message, this.publicUserKeys.find(u => u.user === this.selectedConversation.user).key);

    // Enviamos el mensaje cifrado
    this.chatService.sendMessage(this.user, this.selectedConversation.user, securedMessage.cipher);
  }

  ngOnDestroy() {
    this.destroy$.complete();
  }

  private getPic(name: string) {
    const hash = `${Math.abs(this.hash(name))}`;
    const color = hash.length > 5 ? hash.slice(0, 6) : `${hash.slice(0, 3)}${hash.slice(0, 3)}`;
    return `https://api.adorable.io/avatars/face/eyes${hash[0]}/nose${hash[1]}/mouth${hash[2]}/${color}`;
  }

  private hash(data: string) {
    let hash = 0;
    const len = data.length;
    for (let i = 0; i < len; i++) {
      // tslint:disable-next-line: no-bitwise
      hash = ((hash << 5) - hash) + data.charCodeAt(i);
      // tslint:disable-next-line: no-bitwise
      hash |= 0;
    }
    return hash;
  }
}
