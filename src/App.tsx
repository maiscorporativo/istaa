import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './pages/Layout';
import { Dashboard } from './pages/Dashboard';
import { OrganizationForm } from './pages/OrganizationForm';
import { TagsList } from './pages/TagsList';
import { Login } from './pages/Login';
import { UsersManagement } from './pages/UsersManagement';
import { AuthGuard } from './components/AuthGuard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route path="/" element={<AuthGuard><Layout /></AuthGuard>}>
          <Route index element={<Dashboard />} />
          <Route path="organizations" element={<Navigate to="/" replace />} />
          <Route 
            path="organizations/new" 
            element={<AuthGuard requireRole={['superadmin', 'editor']}><OrganizationForm /></AuthGuard>} 
          />
          <Route path="organizations/edit/:id" element={<OrganizationForm />} />
          <Route 
            path="tags" 
            element={<AuthGuard requireRole={['superadmin', 'editor']}><TagsList /></AuthGuard>} 
          />
          <Route 
            path="users" 
            element={<AuthGuard requireRole={['superadmin']}><UsersManagement /></AuthGuard>} 
          />
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
