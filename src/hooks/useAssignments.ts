import { useState, useEffect } from 'react';
import { repo, type Assignment, type Step, type TaskStatus } from '../data/repo';

export function useAssignments(statuses?: TaskStatus[]) {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAssignments = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await repo.list({ statuses });
      setAssignments(data);
    } catch (err) {
      console.error('Failed to load assignments:', err);
      setError('Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssignments();
  }, [statuses?.join(',')]);

  const createAssignment = async (assignmentData: Omit<Assignment, 'id' | 'created_at'>) => {
    try {
      const newAssignment = await repo.create(assignmentData);
      setAssignments(prev => [newAssignment, ...prev]);
      return newAssignment;
    } catch (err) {
      console.error('Failed to create assignment:', err);
      throw err;
    }
  };

  const updateAssignment = async (id: string, updates: Partial<Assignment>) => {
    try {
      const updatedAssignment = await repo.update(id, updates);
      setAssignments(prev => prev.map(a => a.id === id ? updatedAssignment : a));
      return updatedAssignment;
    } catch (err) {
      console.error('Failed to update assignment:', err);
      throw err;
    }
  };

  const refreshAssignments = () => {
    loadAssignments();
  };

  return {
    assignments,
    loading,
    error,
    createAssignment,
    updateAssignment,
    refreshAssignments
  };
}

export function useAssignmentSteps(assignmentId: string) {
  const [steps, setSteps] = useState<Step[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSteps = async () => {
    if (!assignmentId) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await repo.listSteps(assignmentId);
      setSteps(data);
    } catch (err) {
      console.error('Failed to load steps:', err);
      setError('Failed to load steps');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSteps();
  }, [assignmentId]);

  const createStep = async (stepData: Omit<Step, 'id'>) => {
    try {
      const newStep = await repo.createStep(stepData);
      setSteps(prev => [...prev, newStep].sort((a, b) => a.order_index - b.order_index));
      return newStep;
    } catch (err) {
      console.error('Failed to create step:', err);
      throw err;
    }
  };

  const updateStep = async (id: string, updates: Partial<Step>) => {
    try {
      const updatedStep = await repo.updateStep(id, updates);
      setSteps(prev => prev.map(s => s.id === id ? updatedStep : s));
      return updatedStep;
    } catch (err) {
      console.error('Failed to update step:', err);
      throw err;
    }
  };

  const refreshSteps = () => {
    loadSteps();
  };

  return {
    steps,
    loading,
    error,
    createStep,
    updateStep,
    refreshSteps
  };
}