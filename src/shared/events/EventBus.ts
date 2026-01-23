import { EventEmitter } from 'events';

export interface TicketCreatedEvent {
  ticketId: string;
  subject: string;
  requesterId: string;
  requesterEmail: string;
  requesterName: string;
  organizationId: string;
}

export interface CommentAddedEvent {
  ticketId: string;
  commentId: string;
  ticketSubject: string;
  authorId: string;
  authorName: string;
  text: string;
  isPublic: boolean;
  requesterId: string;
  requesterEmail: string;
}

export interface TicketUpdatedEvent {
  ticketId: string;
  subject: string;
  oldStatus?: string;
  newStatus?: string;
  requesterId: string;
  requesterEmail: string;
}

export type EventTypes = {
  'ticket.created': TicketCreatedEvent;
  'comment.added': CommentAddedEvent;
  'ticket.updated': TicketUpdatedEvent;
};

export class EventBus extends EventEmitter {
  private static instance: EventBus;

  private constructor() {
    super();
  }

  static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }

  emit<K extends keyof EventTypes>(event: K, data: EventTypes[K]): boolean {
    return super.emit(event, data);
  }

  on<K extends keyof EventTypes>(
    event: K,
    listener: (data: EventTypes[K]) => void
  ): this {
    return super.on(event, listener);
  }

  once<K extends keyof EventTypes>(
    event: K,
    listener: (data: EventTypes[K]) => void
  ): this {
    return super.once(event, listener);
  }

  off<K extends keyof EventTypes>(
    event: K,
    listener: (data: EventTypes[K]) => void
  ): this {
    return super.off(event, listener);
  }
}

export const eventBus = EventBus.getInstance();
