// src/services/mock/index.ts

import { initializeMockData } from './mockService';
import { MockTaskService } from './mockService';
import { MockSubtaskService } from './mockService';
import { MockProjectService } from './mockService';
import { MockUserService } from './mockService';
import { MockProjectMemberService } from './mockService';
import { MockCommentService } from './mockService';
import { MockSprintService } from './mockService';

// src/services/mock/index.ts
export * from './mockData';
export * from './mockService';

// Función de utilidad para cambiar entre servicios reales y mock
export const configureServices = (useMock: boolean = true) => {
  if (useMock) {
    // Inicializar datos mock
    initializeMockData();
  }
  
  return {
    useMock,
    taskService: useMock ? MockTaskService : null, // Se reemplazaría por el servicio real
    subtaskService: useMock ? MockSubtaskService : null,
    projectService: useMock ? MockProjectService : null,
    userService: useMock ? MockUserService : null,
    projectMemberService: useMock ? MockProjectMemberService : null,
    commentService: useMock ? MockCommentService : null,
    sprintService: useMock ? MockSprintService : null,
  };
};