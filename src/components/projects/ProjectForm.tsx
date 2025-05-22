import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { IProject, ProjectStatus } from '@/core/interfaces/models';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface ProjectFormProps {
  project?: IProject;
  onSubmit: (projectData: Omit<IProject, 'id' | 'created_at' | 'updated_at'>) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const ProjectForm: React.FC<ProjectFormProps> = ({
  project,
  onSubmit,
  onCancel,
  isSubmitting = false,
}) => {
  const [formData, setFormData] = useState<Omit<IProject, 'id' | 'created_at' | 'updated_at'>>({
    name: '',
    description: '',
    start_date: new Date().toISOString(),
    end_date: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString(),
    status: ProjectStatus.PLANNING,
  });

  // Initialize form with project data if it exists
  useEffect(() => {
    if (project) {
      const projectData = {
        name: project.name,
        description: project.description,
        start_date: project.start_date,
        end_date: project.end_date,
        status: project.status,
      };
      setFormData(projectData);
    }
  }, [project]);

  // Handle changes for inputs and textareas
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle date changes using the native date input
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // Convert the date string from the input to ISO format and fix timezone issue
    // by creating a date at noon to avoid timezone shifting the day
    const date = new Date(`${value}T12:00:00`);
    setFormData((prev) => ({ ...prev, [name]: date.toISOString() }));
  };

  // Handle select changes
  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: parseInt(value) }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  // Format date for the date input (YYYY-MM-DD) with timezone correction
  const formatDateForInput = (dateString: string) => {
    const date = new Date(dateString);
    // Extract the year, month, and day directly to avoid timezone issues
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Get status label based on status value
  const getStatusLabel = (status: number): string => {
    switch (status) {
      case 0: return "Planificación";
      case 1: return "Activo";
      case 2: return "Completado";
      case 3: return "En pausa";
      default: return "Selecciona el estado";
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Nombre del Proyecto <span className="text-red-500">*</span>
        </label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Nombre del proyecto"
          required
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Descripción <span className="text-red-500">*</span>
        </label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Descripción detallada del proyecto"
          required
          rows={4}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="start_date" className="block text-sm font-medium text-gray-700 mb-1">
            Fecha de inicio <span className="text-red-500">*</span>
          </label>
          <Input
            type="date"
            id="start_date"
            name="start_date"
            value={formatDateForInput(formData.start_date)}
            onChange={handleDateChange}
            className="w-full"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            {formData.start_date && format(new Date(formData.start_date), 'PPP', { locale: es })}
          </p>
        </div>

        <div>
          <label htmlFor="end_date" className="block text-sm font-medium text-gray-700 mb-1">
            Fecha de fin <span className="text-red-500">*</span>
          </label>
          <Input
            type="date"
            id="end_date"
            name="end_date"
            value={formatDateForInput(formData.end_date)}
            onChange={handleDateChange}
            className="w-full"
            min={formatDateForInput(formData.start_date)}
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            {formData.end_date && format(new Date(formData.end_date), 'PPP', { locale: es })}
          </p>
        </div>
      </div>

      <div>
        <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
          Estado <span className="text-red-500">*</span>
        </label>
        <Select
          value={formData.status.toString()}
          onValueChange={(value) => handleSelectChange('status', value)}
        >
          <SelectTrigger className="w-full">
            <SelectValue>{getStatusLabel(formData.status)}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0">Planificación</SelectItem>
            <SelectItem value="1">Activo</SelectItem>
            <SelectItem value="2">Completado</SelectItem>
            <SelectItem value="3">En pausa</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Guardando...' : project ? 'Actualizar proyecto' : 'Crear proyecto'}
        </Button>
      </div>
    </form>
  );
};

export default ProjectForm;