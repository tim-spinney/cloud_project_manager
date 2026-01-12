import { createRootRoute, Outlet } from '@tanstack/react-router';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '../lib/queryClient';
import styled from 'styled-components';

const Container = styled.div`
  min-height: 100vh;
  background: #f5f5f5;
`;

const Header = styled.header`
  background: #fff;
  border-bottom: 1px solid #e0e0e0;
  padding: 1rem 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h1`
  margin: 0;
  font-size: 1.5rem;
  color: #333;
`;

const Main = styled.main`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

export const Route = createRootRoute({
  component: () => (
    <QueryClientProvider client={queryClient}>
      <Container>
        <Header>
          <Title>Cloud Project Manager</Title>
        </Header>
        <Main>
          <Outlet />
        </Main>
      </Container>
    </QueryClientProvider>
  ),
});
