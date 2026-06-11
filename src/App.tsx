import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './pages/Layout';
import { Dashboard } from './pages/Dashboard';
import { OrganizationForm } from './pages/OrganizationForm';
import { TagsList } from './pages/TagsList';

function App() {
  return (
    <BrowserRouter basename="/projetos/istaa">
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="organizations" element={<Navigate to="/" replace />} />
          <Route path="organizations/new" element={<OrganizationForm />} />
          <Route path="organizations/edit/:id" element={<OrganizationForm />} />
          <Route path="tags" element={<TagsList />} />
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
