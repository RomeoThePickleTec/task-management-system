// src/core/patterns/bridge.ts
// Bridge Pattern: Separator de tareas y métodos de notificación
export interface NotificationSender {
    send(message: string, recipient: string): void;
  }
  
  export class EmailNotification implements NotificationSender {
    send(message: string, recipient: string): void {
      console.log(`Sending email to ${recipient}: ${message}`);
      // Aquí iría la lógica real de envío de correos
    }
  }
  
  export class SlackNotification implements NotificationSender {
    send(message: string, recipient: string): void {
      console.log(`Sending Slack message to ${recipient}: ${message}`);
      // Aquí iría la lógica real de envío de mensajes a Slack
    }
  }
  
  export class TaskNotifier {
    private sender: NotificationSender;
  
    constructor(sender: NotificationSender) {
      this.sender = sender;
    }
  
    notifyTaskCreated(task: ITask, user: IUser): void {
      const message = `New task created: ${task.title}`;
      this.sender.send(message, user.email);
    }
  
    notifyTaskUpdated(task: ITask, user: IUser): void {
      const message = `Task updated: ${task.title}`;
      this.sender.send(message, user.email);
    }
  
    notifyTaskCompleted(task: ITask, user: IUser): void {
      const message = `Task completed: ${task.title}`;
      this.sender.send(message, user.email);
    }
  }
  