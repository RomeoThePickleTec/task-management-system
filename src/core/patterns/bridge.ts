// src/core/patterns/bridge.ts
// Bridge Pattern: Separar la implementación de notificaciones de su uso

// Abstracción para notificaciones
export interface NotificationSender {
  send(message: string, recipient: string): Promise<boolean>;
}

// Implementaciones concretas
export class EmailNotification implements NotificationSender {
  async send(message: string, recipient: string): Promise<boolean> {
    console.log(`Sending email to ${recipient}: ${message}`);
    // Simular envío exitoso
    return true;
  }
}

export class SlackNotification implements NotificationSender {
  async send(message: string, recipient: string): Promise<boolean> {
    console.log(`Sending Slack message to ${recipient}: ${message}`);
    // Simular envío exitoso
    return true;
  }
}

export class PushNotification implements NotificationSender {
  async send(message: string, recipient: string): Promise<boolean> {
    console.log(`Sending push notification to ${recipient}: ${message}`);
    // Simular envío exitoso
    return true;
  }
}

// Abstracción refinada
export class NotificationManager {
  private sender: NotificationSender;

  constructor(sender: NotificationSender) {
    this.sender = sender;
  }

  changeSender(sender: NotificationSender): void {
    this.sender = sender;
  }

  async notifyTaskCreated(task: { title: string }, recipient: string): Promise<boolean> {
    return await this.sender.send(`New task created: ${task.title}`, recipient);
  }

  async notifyTaskUpdated(task: { title: string }, recipient: string): Promise<boolean> {
    return await this.sender.send(`Task updated: ${task.title}`, recipient);
  }

  async notifyTaskCompleted(task: { title: string }, recipient: string): Promise<boolean> {
    return await this.sender.send(`Task completed: ${task.title}`, recipient);
  }

  async notifySprintStarted(sprint: { name: string }, recipient: string): Promise<boolean> {
    return await this.sender.send(`Sprint started: ${sprint.name}`, recipient);
  }

  async notifySprintEnded(sprint: { name: string }, recipient: string): Promise<boolean> {
    return await this.sender.send(`Sprint ended: ${sprint.name}`, recipient);
  }

  async notifyCommentAdded(task: { title: string }, recipient: string): Promise<boolean> {
    return await this.sender.send(`New comment on task: ${task.title}`, recipient);
  }
}