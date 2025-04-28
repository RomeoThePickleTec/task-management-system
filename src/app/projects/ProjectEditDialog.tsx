import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PenSquare } from "lucide-react";
import { IProject } from '@/core/interfaces/models';
import ProjectForm from './ProjectForm';

interface ProjectEditDialogProps {
  project: IProject;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (projectData: Omit<IProject, 'id' | 'created_at' | 'updated_at'>) => void;
  isSubmitting: boolean;
}

const ProjectEditDialog: React.FC<ProjectEditDialogProps> = ({
  project,
  isOpen,
  onOpenChange,
  onSubmit,
  isSubmitting
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <PenSquare className="h-4 w-4 mr-2" /> Editar
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Editar Proyecto</DialogTitle>
          <DialogDescription>
            Actualiza los detalles del proyecto. Los campos marcados con * son obligatorios.
          </DialogDescription>
        </DialogHeader>
        <ProjectForm
          project={project}
          onSubmit={onSubmit}
          onCancel={() => onOpenChange(false)}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
};

export default ProjectEditDialog;