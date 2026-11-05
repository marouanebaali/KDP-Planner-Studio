/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { PlannerProject, PlannerCategory, KdpValidationReport } from './types/planner';
import {
  getActiveProject,
  getSavedProjects,
  saveProject,
  deleteProject,
  duplicateProject,
  setActiveProjectId,
} from './utils/storage';
import { runKdpPreflightCheck } from './utils/kdpValidator';
import { Navigation } from './components/Navigation';
import { Dashboard } from './components/Dashboard';
import { PageDesigner } from './components/PageDesigner';
import { CoverDesigner } from './components/CoverDesigner';
import { BookPreviewer } from './components/BookPreviewer';
import { ExportModal } from './components/ExportModal';
import { TemplatesLibrary } from './components/TemplatesLibrary';
import { SavedProjects } from './components/SavedProjects';
import { PlannerWizard } from './components/PlannerWizard';

export default function App() {
  const [projects, setProjects] = useState<PlannerProject[]>([]);
  const [activeProject, setActiveProject] = useState<PlannerProject | null>(null);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isWizardOpen, setIsWizardOpen] = useState<boolean>(false);
  const [wizardCategory, setWizardCategory] = useState<PlannerCategory | undefined>();

  // Load projects from storage on mount
  useEffect(() => {
    const loadedProjects = getSavedProjects();
    const active = getActiveProject();
    setProjects(loadedProjects);
    setActiveProject(active);
  }, []);

  const handleUpdateProject = (updated: PlannerProject) => {
    setActiveProject(updated);
    saveProject(updated);
    // Refresh project list
    setProjects(getSavedProjects());
  };

  const handleSelectProject = (proj: PlannerProject) => {
    setActiveProject(proj);
    setActiveProjectId(proj.id);
    setActiveTab('dashboard');
  };

  const handleDuplicateProject = (proj: PlannerProject) => {
    const copy = duplicateProject(proj);
    const updatedList = getSavedProjects();
    setProjects(updatedList);
    setActiveProject(copy);
  };

  const handleDeleteProject = (projId: string) => {
    const remaining = deleteProject(projId);
    setProjects(remaining);
    setActiveProject(remaining[0] || null);
  };

  const handleStartNewPlanner = (cat?: PlannerCategory) => {
    setWizardCategory(cat);
    setIsWizardOpen(true);
  };

  const handleFinishWizard = (newProject: PlannerProject) => {
    saveProject(newProject);
    setActiveProject(newProject);
    setProjects(getSavedProjects());
    setIsWizardOpen(false);
    setActiveTab('pages'); // Navigate straight to page editor!
  };

  if (!activeProject) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-xl bg-amber-500 animate-pulse mx-auto" />
          <p className="text-sm text-slate-400">Loading KDP Planner Studio...</p>
        </div>
      </div>
    );
  }

  // Live preflight report
  const validationReport: KdpValidationReport = runKdpPreflightCheck(activeProject);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Top Navigation */}
      <Navigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        project={activeProject}
        validationReport={validationReport}
        onNewPlanner={() => handleStartNewPlanner()}
        onOpenExport={() => setActiveTab('export')}
      />

      {/* Main View Area */}
      <main className="flex-1">
        {/* Wizard Modal Overlay */}
        {isWizardOpen ? (
          <div className="min-h-[calc(100vh-120px)] bg-slate-950 py-6">
            <PlannerWizard
              initialCategory={wizardCategory}
              onComplete={handleFinishWizard}
              onCancel={() => setIsWizardOpen(false)}
            />
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <Dashboard
                  project={activeProject}
                  projects={projects}
                  validationReport={validationReport}
                  onNavigate={setActiveTab}
                  onNewPlanner={handleStartNewPlanner}
                  onSelectProject={handleSelectProject}
                  onDuplicateProject={handleDuplicateProject}
                  onExport={() => setActiveTab('export')}
                />
              </div>
            )}

            {activeTab === 'pages' && (
              <PageDesigner
                project={activeProject}
                onUpdateProject={handleUpdateProject}
              />
            )}

            {activeTab === 'cover' && (
              <CoverDesigner
                project={activeProject}
                onUpdateProject={handleUpdateProject}
              />
            )}

            {activeTab === 'preview' && (
              <BookPreviewer
                project={activeProject}
                onNavigateToEditor={(pageIndex) => {
                  setActiveTab('pages');
                }}
              />
            )}

            {activeTab === 'export' && (
              <ExportModal
                project={activeProject}
                validationReport={validationReport}
              />
            )}

            {activeTab === 'templates' && (
              <TemplatesLibrary
                onSelectCategory={(category) => {
                  handleStartNewPlanner(category);
                }}
              />
            )}

            {activeTab === 'projects' && (
              <SavedProjects
                projects={projects}
                activeProjectId={activeProject.id}
                onSelectProject={handleSelectProject}
                onDuplicateProject={handleDuplicateProject}
                onDeleteProject={handleDeleteProject}
                onNewPlanner={() => handleStartNewPlanner()}
                onRefreshProjects={() => setProjects(getSavedProjects())}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}
