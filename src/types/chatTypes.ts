export interface ChatStatus {
  [key: string]: {
    unreads: number;
    last_read_message_id: string | null;
  };
}

export interface ChatroomIdParams {
  chatroom_id: string;
}

export interface GetChatRoomMessagesQuery {
  offset: string;
  length: string;
}
