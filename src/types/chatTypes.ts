export interface ChatStatus {
  [key: string]: {
    unreads: number;
    last_read_message_id: string | null;
  };
}
