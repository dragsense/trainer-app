export class ReminderCreatedEvent {
  constructor(
    public readonly reminderId: number,
    public readonly frequency: string,
    public readonly startAt: Date,
  ) {}
}

export class ReminderUpdatedEvent {
  constructor(
    public readonly reminderId: number,
    public readonly frequency: string,
    public readonly startAt: Date,
    public readonly oldStartAt?: Date,
  ) {}
}

export class ReminderDeletedEvent {
  constructor(
    public readonly reminderId: number,
  ) {}
}
