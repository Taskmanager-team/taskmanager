import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './auth/AuthProvider';
import { Layout } from './components/Layout';
import { LoginPage } from './pages/LoginPage';
import { MembersPage } from './pages/MembersPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { RegisterPage } from './pages/RegisterPage';
import { TasksPage } from './pages/TasksPage';
import { WorkspacesPage } from './pages/WorkspacesPage';
import { ProtectedRoute } from './routes/ProtectedRoute';
import './App.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 1 },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            <Route element={<ProtectedRoute />}>
              <Route element={<Layout />}>
                <Route path="/" element={<WorkspacesPage />} />
                <Route
                  path="/workspaces/:workspaceId"
                  element={<ProjectsPage />}
                />
                <Route
                  path="/workspaces/:workspaceId/members"
                  element={<MembersPage />}
                />
                <Route
                  path="/projects/:projectId/tasks"
                  element={<TasksPage />}
                />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
