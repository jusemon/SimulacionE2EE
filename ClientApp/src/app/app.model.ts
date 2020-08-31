export interface Message {
  text: string;
  date: Date;
  reply: boolean;
  type: 'file' | 'text';
  user: {
    name: string;
    avatar: string;
  };
  files?: Array<any>;
}

export interface Conversation {
  user: string;
  messages: Array<Message>;
}

export interface UserKey {
  user: string;
  key: string;
}

export interface InitConversationInfo {
  fromUser: string;
  toUser: string;
}

export interface MessageExt {
  fromUser: string;
  toUser: string;
  message: string;
}

export interface PublicKeyRequestExt {
  fromUser: string;
  toUser: string;
}

export interface PublicKeyExt {
  fromUser: string;
  toUser: string;
  publicKey: string;
}
