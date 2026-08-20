import { Navigate, Route, Routes } from "react-router-dom";

import AppShell from "@/components/layout/AppShell";
import ProjectDetailsPage from "@/pages/ProjectDetailsPage";
import ProjectsPage from "@/pages/ProjectsPage";

const AppRouter = () => {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<Navigate to="/projects" replace />} />

        <Route path="/projects" element={<ProjectsPage />} />

        <Route path="/projects/:projectId" element={<ProjectDetailsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/projects" replace />} />
    </Routes>
  );
};

export default AppRouter;

