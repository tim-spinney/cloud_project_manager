import { createFileRoute, Link } from '@tanstack/react-router';
import { useProject, useTasksByProject } from '../lib/queries';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
`;

const ProjectInfo = styled.div`
  flex: 1;
`;

const ProjectName = styled.h2`
  margin: 0 0 0.5rem 0;
  color: #333;
`;

const ProjectDescription = styled.p`
  margin: 0 0 0.5rem 0;
  color: #666;
`;

const ProjectMeta = styled.div`
  display: flex;
  gap: 1rem;
  font-size: 0.9rem;
  color: #999;
  margin-top: 0.5rem;
`;

const BackLink = styled(Link)`
  color: #007bff;
  text-decoration: none;
  font-weight: 500;
  
  &:hover {
    text-decoration: underline;
  }
`;

const TasksSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const SectionTitle = styled.h3`
  margin: 0;
  color: #333;
  font-size: 1.25rem;
`;

const TasksList = styled.div`
  display: grid;
  gap: 1rem;
`;

const TaskCard = styled.div`
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 1.5rem;
  transition: box-shadow 0.2s;
  
  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
`;

const TaskTitle = styled.h4`
  margin: 0 0 0.5rem 0;
  color: #333;
  font-size: 1.1rem;
`;

const TaskDescription = styled.p`
  margin: 0 0 0.5rem 0;
  color: #666;
  font-size: 0.9rem;
`;

const TaskMeta = styled.div`
  display: flex;
  gap: 1rem;
  font-size: 0.85rem;
  color: #999;
  flex-wrap: wrap;
`;

const StatusBadge = styled.span<{ status?: string }>`
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
  background: ${props => {
    switch (props.status?.toLowerCase()) {
      case 'done':
      case 'completed':
        return '#d4edda';
      case 'in progress':
      case 'in-progress':
        return '#fff3cd';
      default:
        return '#e9ecef';
    }
  }};
  color: ${props => {
    switch (props.status?.toLowerCase()) {
      case 'done':
      case 'completed':
        return '#155724';
      case 'in progress':
      case 'in-progress':
        return '#856404';
      default:
        return '#495057';
    }
  }};
`;

const Loading = styled.div`
  text-align: center;
  padding: 2rem;
  color: #666;
`;

const Error = styled.div`
  background: #fee;
  border: 1px solid #fcc;
  border-radius: 4px;
  padding: 1rem;
  color: #c33;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: #999;
  background: white;
  border: 1px dashed #ddd;
  border-radius: 8px;
`;

export const Route = createFileRoute('/projects/$projectId')({
  component: ProjectTasksPage,
});

function ProjectTasksPage() {
  const { projectId } = Route.useParams();
  const { data: project, isLoading: projectLoading, error: projectError } = useProject(projectId);
  const { data: tasks, isLoading: tasksLoading, error: tasksError } = useTasksByProject(projectId);

  if (projectLoading) {
    return <Loading>Loading project...</Loading>;
  }

  if (projectError) {
    return <Error>Error loading project: {projectError.message}</Error>;
  }

  if (!project) {
    return <Error>Project not found</Error>;
  }

  return (
    <Container>
      <Header>
        <ProjectInfo>
          <BackLink to="/">← Back to Projects</BackLink>
          <ProjectName>{project.name}</ProjectName>
          <ProjectDescription>{project.description || 'No description'}</ProjectDescription>
          <ProjectMeta>
            <span>Owner: {project.owner_id}</span>
            <span>Members: {project.member_ids.length}</span>
            <span>Created: {new Date(project.created_at).toLocaleDateString()}</span>
          </ProjectMeta>
        </ProjectInfo>
      </Header>

      <TasksSection>
        <SectionTitle>Tasks</SectionTitle>
        {tasksLoading ? (
          <Loading>Loading tasks...</Loading>
        ) : tasksError ? (
          <Error>Error loading tasks: {tasksError.message}</Error>
        ) : tasks && tasks.length > 0 ? (
          <TasksList>
            {tasks.map((task) => (
              <TaskCard key={task.id}>
                <TaskTitle>{task.title}</TaskTitle>
                <TaskDescription>{task.description || 'No description'}</TaskDescription>
                <TaskMeta>
                  {task.status && <StatusBadge status={task.status}>{task.status}</StatusBadge>}
                  {task.estimate && <span>Estimate: {task.estimate}h</span>}
                  {task.assigneeId && <span>Assignee: {task.assigneeId}</span>}
                  <span>Created: {new Date(task.createdAt).toLocaleDateString()}</span>
                </TaskMeta>
              </TaskCard>
            ))}
          </TasksList>
        ) : (
          <EmptyState>No tasks found for this project.</EmptyState>
        )}
      </TasksSection>
    </Container>
  );
}
