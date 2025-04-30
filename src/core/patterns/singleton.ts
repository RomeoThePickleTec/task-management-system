// src/core/patterns/singleton.ts
// Singleton para gestionar el estado de la aplicación en memoria

import {
  ITask,
  ISubtask,
  IProject,
  IUser,
  IProjectMember,
  IComment,
  ISprint,
} from '../interfaces/models';

export class AppState {
  private static instance: AppState | null = null;

  private tasks: Map<number, ITask> = new Map();
  private subtasks: Map<number, ISubtask> = new Map();
  private projects: Map<number, IProject> = new Map();
  private users: Map<number, IUser> = new Map();
  private projectMembers: IProjectMember[] = [];
  private comments: Map<number, IComment> = new Map();
  private sprints: Map<number, ISprint> = new Map();

  private constructor() {
    // Privado para prevenir instanciación directa
  }

  public static getInstance(): AppState {
    if (!AppState.instance) {
      AppState.instance = new AppState();
    }
    return AppState.instance;
  }

  // Tasks
  public getTasks(): ITask[] {
    return Array.from(this.tasks.values());
  }

  public getTaskById(id: number): ITask | undefined {
    return this.tasks.get(id);
  }

  public setTasks(tasks: ITask[]): void {
    this.tasks.clear();
    tasks.forEach((task) => {
      if (task.id) {
        this.tasks.set(task.id, task);
      }
    });
  }

  public addTask(task: ITask): void {
    if (task.id) {
      this.tasks.set(task.id, task);
    }
  }

  public updateTask(task: ITask): boolean {
    if (task.id && this.tasks.has(task.id)) {
      this.tasks.set(task.id, task);
      return true;
    }
    return false;
  }

  public deleteTask(id: number): boolean {
    return this.tasks.delete(id);
  }

  public getTasksByProject(projectId: number): ITask[] {
    return this.getTasks().filter((task) => task.project_id === projectId);
  }

  public getTasksBySprint(sprintId: number): ITask[] {
    return this.getTasks().filter((task) => task.sprint_id === sprintId);
  }

  // Subtasks
  public getSubtasks(): ISubtask[] {
    return Array.from(this.subtasks.values());
  }

  public getSubtaskById(id: number): ISubtask | undefined {
    return this.subtasks.get(id);
  }

  public getSubtasksByTask(taskId: number): ISubtask[] {
    return this.getSubtasks().filter((subtask) => subtask.task_id === taskId);
  }

  public setSubtasks(subtasks: ISubtask[]): void {
    this.subtasks.clear();
    subtasks.forEach((subtask) => {
      if (subtask.id) {
        this.subtasks.set(subtask.id, subtask);
      }
    });
  }

  public addSubtask(subtask: ISubtask): void {
    if (subtask.id) {
      this.subtasks.set(subtask.id, subtask);
    }
  }

  public updateSubtask(subtask: ISubtask): boolean {
    if (subtask.id && this.subtasks.has(subtask.id)) {
      this.subtasks.set(subtask.id, subtask);
      return true;
    }
    return false;
  }

  public deleteSubtask(id: number): boolean {
    return this.subtasks.delete(id);
  }

  // Projects
  public getProjects(): IProject[] {
    return Array.from(this.projects.values());
  }

  public getProjectById(id: number): IProject | undefined {
    return this.projects.get(id);
  }

  public setProjects(projects: IProject[]): void {
    this.projects.clear();
    projects.forEach((project) => {
      if (project.id) {
        this.projects.set(project.id, project);
      }
    });
  }

  public addProject(project: IProject): void {
    if (project.id) {
      this.projects.set(project.id, project);
    }
  }

  public updateProject(project: IProject): boolean {
    if (project.id && this.projects.has(project.id)) {
      this.projects.set(project.id, project);
      return true;
    }
    return false;
  }

  public deleteProject(id: number): boolean {
    return this.projects.delete(id);
  }

  // Users
  public getUsers(): IUser[] {
    return Array.from(this.users.values());
  }

  public getUserById(id: number): IUser | undefined {
    return this.users.get(id);
  }

  public setUsers(users: IUser[]): void {
    this.users.clear();
    users.forEach((user) => {
      if (user.id) {
        this.users.set(user.id, user);
      }
    });
  }

  public addUser(user: IUser): void {
    if (user.id) {
      this.users.set(user.id, user);
    }
  }

  public updateUser(user: IUser): boolean {
    if (user.id && this.users.has(user.id)) {
      this.users.set(user.id, user);
      return true;
    }
    return false;
  }

  public deleteUser(id: number): boolean {
    return this.users.delete(id);
  }

  // Project Members
  public getProjectMembers(): IProjectMember[] {
    return [...this.projectMembers];
  }

  public getProjectMembersByProject(projectId: number): IProjectMember[] {
    return this.projectMembers.filter((pm) => pm.project_id === projectId);
  }

  public getProjectMembersByUser(userId: number): IProjectMember[] {
    return this.projectMembers.filter((pm) => pm.user_id === userId);
  }

  public setProjectMembers(projectMembers: IProjectMember[]): void {
    this.projectMembers = [...projectMembers];
  }

  public addProjectMember(projectMember: IProjectMember): void {
    this.projectMembers.push(projectMember);
  }

  public deleteProjectMember(projectId: number, userId: number): boolean {
    const initialLength = this.projectMembers.length;
    this.projectMembers = this.projectMembers.filter(
      (pm) => !(pm.project_id === projectId && pm.user_id === userId)
    );
    return this.projectMembers.length !== initialLength;
  }

  // Comments
  public getComments(): IComment[] {
    return Array.from(this.comments.values());
  }

  public getCommentById(id: number): IComment | undefined {
    return this.comments.get(id);
  }

  public getCommentsByTask(taskId: number): IComment[] {
    return this.getComments().filter((comment) => comment.task_id === taskId);
  }

  public setComments(comments: IComment[]): void {
    this.comments.clear();
    comments.forEach((comment) => {
      if (comment.id) {
        this.comments.set(comment.id, comment);
      }
    });
  }

  public addComment(comment: IComment): void {
    if (comment.id) {
      this.comments.set(comment.id, comment);
    }
  }

  public updateComment(comment: IComment): boolean {
    if (comment.id && this.comments.has(comment.id)) {
      this.comments.set(comment.id, comment);
      return true;
    }
    return false;
  }

  public deleteComment(id: number): boolean {
    return this.comments.delete(id);
  }

  // Sprints
  public getSprints(): ISprint[] {
    return Array.from(this.sprints.values());
  }

  public getSprintById(id: number): ISprint | undefined {
    return this.sprints.get(id);
  }

  public getSprintsByProject(projectId: number): ISprint[] {
    return this.getSprints().filter((sprint) => sprint.project_id === projectId);
  }

  public getActiveSprintsByProject(projectId: number): ISprint[] {
    return this.getSprintsByProject(projectId).filter((sprint) => sprint.status === 1);
  }

  public setSprints(sprints: ISprint[]): void {
    this.sprints.clear();
    sprints.forEach((sprint) => {
      if (sprint.id) {
        this.sprints.set(sprint.id, sprint);
      }
    });
  }

  public addSprint(sprint: ISprint): void {
    if (sprint.id) {
      this.sprints.set(sprint.id, sprint);
    }
  }

  public updateSprint(sprint: ISprint): boolean {
    if (sprint.id && this.sprints.has(sprint.id)) {
      this.sprints.set(sprint.id, sprint);
      return true;
    }
    return false;
  }

  public deleteSprint(id: number): boolean {
    return this.sprints.delete(id);
  }

  // Resetear todo el estado
  public reset(): void {
    this.tasks.clear();
    this.subtasks.clear();
    this.projects.clear();
    this.users.clear();
    this.projectMembers = [];
    this.comments.clear();
    this.sprints.clear();
  }
}
