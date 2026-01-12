import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useCreateProject } from '../lib/queries';
import { useState } from 'react';
import styled from 'styled-components';

const FormContainer = styled.div`
  max-width: 600px;
  margin: 0 auto;
`;

const Form = styled.form`
  background: white;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h2`
  margin: 0 0 1.5rem 0;
  color: #333;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #333;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  box-sizing: border-box;
  
  &:focus {
    outline: none;
    border-color: #007bff;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  min-height: 100px;
  resize: vertical;
  box-sizing: border-box;
  font-family: inherit;
  
  &:focus {
    outline: none;
    border-color: #007bff;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: background 0.2s;
`;

const PrimaryButton = styled(Button)`
  background: #007bff;
  color: white;
  
  &:hover:not(:disabled) {
    background: #0056b3;
  }
  
  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const SecondaryButton = styled(Button)`
  background: #f0f0f0;
  color: #333;
  
  &:hover {
    background: #e0e0e0;
  }
`;

const Error = styled.div`
  background: #fee;
  border: 1px solid #fcc;
  border-radius: 4px;
  padding: 1rem;
  color: #c33;
  margin-bottom: 1rem;
`;

export const Route = createFileRoute('/projects/new')({
  component: CreateProjectPage,
});

function CreateProjectPage() {
  const navigate = useNavigate();
  const createProject = useCreateProject();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [ownerId, setOwnerId] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !ownerId.trim()) {
      return;
    }

    try {
      const result = await createProject.mutateAsync({
        name: name.trim(),
        description: description.trim() || undefined,
        owner_id: ownerId.trim(),
      });
      
      navigate({ to: '/projects/$projectId', params: { projectId: result.id } });
    } catch (error) {
      // Error is handled by the mutation state
      console.error('Failed to create project:', error);
    }
  };

  return (
    <FormContainer>
      <Form onSubmit={handleSubmit}>
        <Title>Create New Project</Title>
        
        {createProject.isError && (
          <Error>
            Error creating project: {createProject.error instanceof Error ? createProject.error.message : 'Unknown error'}
          </Error>
        )}

        <FormGroup>
          <Label htmlFor="name">Project Name *</Label>
          <Input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Enter project name"
          />
        </FormGroup>

        <FormGroup>
          <Label htmlFor="description">Description</Label>
          <TextArea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter project description"
          />
        </FormGroup>

        <FormGroup>
          <Label htmlFor="ownerId">Owner ID *</Label>
          <Input
            id="ownerId"
            type="text"
            value={ownerId}
            onChange={(e) => setOwnerId(e.target.value)}
            required
            placeholder="Enter owner ID"
          />
        </FormGroup>

        <ButtonGroup>
          <SecondaryButton
            type="button"
            onClick={() => navigate({ to: '/' })}
          >
            Cancel
          </SecondaryButton>
          <PrimaryButton
            type="submit"
            disabled={createProject.isPending || !name.trim() || !ownerId.trim()}
          >
            {createProject.isPending ? 'Creating...' : 'Create Project'}
          </PrimaryButton>
        </ButtonGroup>
      </Form>
    </FormContainer>
  );
}
