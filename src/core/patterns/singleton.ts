// src/core/patterns/singleton.ts
// Singleton Pattern: Para manejar la base de datos en memoria
export class InMemoryDatabase {
    private static instance: InMemoryDatabase | null = null;
    
    private tasks: ITask[] = [];
    private subtasks: ISubtask[] = [];
    private projects: IProject[] = [];
    private users: IUser[] = [];
    private projectMembers: IProjectMember[] = [];
    
    private constructor() {
      // Constructor privado para evitar instanciación directa
    }
    
    public static getInstance(): InMemoryDatabase {
      if (!InMemoryDatabase.instance) {
        InMemoryDatabase.instance = new InMemoryDatabase();
      }
      return InMemoryDatabase.instance;
    }
    
    // Tasks CRUD
    public getTasks(): ITask[] {
      return [...this.tasks];
    }
    
    public getTaskById(id: number): ITask | undefined {
      return this.tasks.find(task => task.id === id);
    }
    
    public addTask(task: ITask): ITask {
      const newId = this.tasks.length > 0 ? Math.max(...this.tasks.map(t => t.id)) + 1 : 1;
      const newTask = { ...task, id: newId };
      this.tasks.push(newTask);
      return newTask;
    }
    
    public updateTask(id: number, taskData: Partial<ITask>): ITask | null {
      const index = this.tasks.findIndex(task => task.id === id);
      if (index === -1) return null;
      
      const updatedTask = { ...this.tasks[index], ...taskData, updated_at: new Date().toISOString() };
      this.tasks[index] = updatedTask;
      return updatedTask;
    }
    
    public deleteTask(id: number): boolean {
      const initialLength = this.tasks.length;
      this.tasks = this.tasks.filter(task => task.id !== id);
      return this.tasks.length !== initialLength;
    }
    
    // Subtasks CRUD
    public getSubtasks(): ISubtask[] {
      return [...this.subtasks];
    }
    
    public getSubtaskById(id: number): ISubtask | undefined {
      return this.subtasks.find(subtask => subtask.id === id);
    }
    
    public addSubtask(subtask: ISubtask): ISubtask {
      const newId = this.subtasks.length > 0 ? Math.max(...this.subtasks.map(t => t.id as number)) + 1 : 1;
      const newSubtask = { ...subtask, id: newId };
      this.subtasks.push(newSubtask);
      return newSubtask;
    }
    
    public updateSubtask(id: number, subtaskData: Partial<ISubtask>): ISubtask | null {
      const index = this.subtasks.findIndex(subtask => subtask.id === id);
      if (index === -1) return null;
      
      const updatedSubtask = { ...this.subtasks[index], ...subtaskData, updated_at: new Date().toISOString() };
      this.subtasks[index] = updatedSubtask;
      return updatedSubtask;
    }
    
    public deleteSubtask(id: number): boolean {
      const initialLength = this.subtasks.length;
      this.subtasks = this.subtasks.filter(subtask => subtask.id !== id);
      return this.subtasks.length !== initialLength;
    }
    
    // Projects CRUD
    public getProjects(): IProject[] {
      return [...this.projects];
    }
    
    public getProjectById(id: number): IProject | undefined {
      return this.projects.find(project => project.id === id);
    }
    
    public addProject(project: IProject): IProject {
      const newId = this.projects.length > 0 ? Math.max(...this.projects.map(p => p.id as number)) + 1 : 1;
      const newProject = { ...project, id: newId };
      this.projects.push(newProject);
      return newProject;
    }
    
    public updateProject(id: number, projectData: Partial<IProject>): IProject | null {
      const index = this.projects.findIndex(project => project.id === id);
      if (index === -1) return null;
      
      const updatedProject = { ...this.projects[index], ...projectData, updated_at: new Date().toISOString() };
      this.projects[index] = updatedProject;
      return updatedProject;
    }
    
    public deleteProject(id: number): boolean {
      const initialLength = this.projects.length;
      this.projects = this.projects.filter(project => project.id !== id);
      return this.projects.length !== initialLength;
    }
    
    // Users CRUD
    public getUsers(): IUser[] {
      return [...this.users];
    }
    
    public getUserById(id: number): IUser | undefined {
      return this.users.find(user => user.id === id);
    }
    
    public addUser(user: IUser): IUser {
      const newId = this.users.length > 0 ? Math.max(...this.users.map(u => u.id as number)) + 1 : 1;
      const newUser = { ...user, id: newId };
      this.users.push(newUser);
      return newUser;
    }
    
    public updateUser(id: number, userData: Partial<IUser>): IUser | null {
      const index = this.users.findIndex(user => user.id === id);
      if (index === -1) return null;
      
      const updatedUser = { ...this.users[index], ...userData, updated_at: new Date().toISOString() };
      this.users[index] = updatedUser;
      return updatedUser;
    }
    
    public deleteUser(id: number): boolean {
      const initialLength = this.users.length;
      this.users = this.users.filter(user => user.id !== id);
      return this.users.length !== initialLength;
    }
    
    // ProjectMembers CRUD
    public getProjectMembers(): IProjectMember[] {
      return [...this.projectMembers];
    }
    
    public getProjectMembersByProject(projectId: number): IProjectMember[] {
      return this.projectMembers.filter(pm => pm.project_id === projectId);
    }
    
    public getProjectMembersByUser(userId: number): IProjectMember[] {
      return this.projectMembers.filter(pm => pm.user_id === userId);
    }
    
    public addProjectMember(projectMember: IProjectMember): IProjectMember {
      const newProjectMember = { 
        ...projectMember, 
        id: {
          projectId: projectMember.project_id,
          userId: projectMember.user_id
        }
      };
      this.projectMembers.push(newProjectMember);
      return newProjectMember;
    }
    
    public deleteProjectMember(projectId: number, userId: number): boolean {
      const initialLength = this.projectMembers.length;
      this.projectMembers = this.projectMembers.filter(
        pm => !(pm.project_id === projectId && pm.user_id === userId)
      );
      return this.projectMembers.length !== initialLength;
    }
    
    // Inicializar con datos de ejemplo
    public loadInitialData(data: {
      tasks?: ITask[],
      subtasks?: ISubtask[],
      projects?: IProject[],
      users?: IUser[],
      projectMembers?: IProjectMember[]
    }): void {
      if (data.tasks) this.tasks = data.tasks;
      if (data.subtasks) this.subtasks = data.subtasks;
      if (data.projects) this.projects = data.projects;
      if (data.users) this.users = data.users;
      if (data.projectMembers) this.projectMembers = data.projectMembers;
    }
  }
  