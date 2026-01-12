import { createFileRoute, Link } from '@tanstack/react-router';
import { useProjects } from '../lib/queries';
import styled from 'styled-components';

const ProjectsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const PageTitle = styled.h2`
  margin: 0;
  color: #333;
`;

const CreateButton = styled(Link)`
  background: #007bff;
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  text-decoration: none;
  font-weight: 500;
  transition: background 0.2s;
  
  &:hover {
    background: #0056b3;
  }
`;

const ProjectsList = styled.div`
  display: grid;
  gap: 1rem;
`;

const ProjectCard = styled(Link)`
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 1.5rem;
  text-decoration: none;
  color: inherit;
  transition: box-shadow 0.2s, transform 0.2s;
  
  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }
`;

const ProjectName = styled.h3`
  margin: 0 0 0.5rem 0;
  color: #333;
  font-size: 1.25rem;
`;

const ProjectDescription = styled.p`
  margin: 0 0 0.5rem 0;
  color: #666;
  font-size: 0.9rem;
`;

const ProjectMeta = styled.div`
  display: flex;
  gap: 1rem;
  font-size: 0.85rem;
  color: #999;
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

export const Route = createFileRoute('/')({
  component: ProjectsListPage,
});

function ProjectsListPage() {
  const { data: projects, isLoading, error } = useProjects();

  if (isLoading) {
    return <Loading>Loading projects...</Loading>;
  }

  if (error) {
    return <Error>Error loading projects: {error.message}</Error>;
  }

  return (
    <ProjectsContainer>
      <Header>
        <PageTitle>Projects</PageTitle>
        <CreateButton to="/projects/new">Create New Project</CreateButton>
      </Header>
      <ProjectsList>
        {projects && projects.length > 0 ? (
          projects.map((project) => (
            <ProjectCard key={project.id} to="/projects/$projectId" params={{ projectId: project.id }}>
              <ProjectName>{project.name}</ProjectName>
              <ProjectDescription>{project.description || 'No description'}</ProjectDescription>
              <ProjectMeta>
                <span>Owner: {project.owner_id}</span>
                <span>Members: {project.member_ids.length}</span>
                <span>Created: {new Date(project.created_at).toLocaleDateString()}</span>
              </ProjectMeta>
            </ProjectCard>
          ))
        ) : (
          <div>No projects found. Create your first project!</div>
        )}
      </ProjectsList>
    </ProjectsContainer>
  );
}
