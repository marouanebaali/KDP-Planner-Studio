import { PlannerProject, PlannerCategory } from '../types/planner';
import { COVER_PRESETS, buildStarterPages } from '../data/defaultTemplates';

const STORAGE_KEY = 'kdp_planner_studio_projects_v1';
const ACTIVE_PROJECT_ID_KEY = 'kdp_planner_studio_active_id_v1';

/**
 * Creates a brand new default planner project
 */
export function createDefaultProject(
  category: PlannerCategory = 'Weekly Planner',
  pageCount: number = 80,
  title: string = 'Master Weekly Planner',
  author: string = 'Planner Studio Publishing'
): PlannerProject {
  const year = 2026;
  const initialPages = buildStarterPages(category, pageCount, title, author, year);

  return {
    id: `project_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    name: title,
    title,
    subtitle: 'A Guided Framework for Intentional Productivity & Growth',
    author,
    category,
    year,
    language: 'English',
    targetAudience: 'Professionals, entrepreneurs, and organized individuals',
    trimSize: '6x9',
    paperType: 'white',
    interiorStyle: 'minimalist',
    pageCount: initialPages.length,
    hasBleed: false,
    isDoubleSided: true,
    includeIntro: true,
    includeNotes: true,
    startDayOfWeek: 1, // Monday start
    pages: initialPages,
    cover: {
      theme: 'luxury',
      primaryColor: '#0f172a',
      secondaryColor: '#1e293b',
      textColor: '#f8fafc',
      accentColor: '#eab308',
      title: title.toUpperCase(),
      subtitle: '2026 ANNUAL & WEEKLY EDITION',
      author,
      spineText: title.toUpperCase(),
      backCoverBlurb:
        'Transform your ambitions into daily results. Designed with an intentional structure for focus, clarity, and sustainable routines. Manufactured to official Amazon KDP Paperback publishing standards.',
      backCoverQuotes: ['"Plan with clarity. Execute with confidence."'],
      pattern: 'art_deco',
      finish: 'matte',
      showSpineGuides: true,
      showBarcodeGuide: true,
      showBleedGuides: false,
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    kdpMetadata: {
      keywords: [
        'weekly planner 2026',
        'productivity journal for women and men',
        'goal setting workbook',
        'habit tracker paperback',
        'daily agenda book',
        'undated calendar organizer',
        'kdp low content publishing',
      ],
      categories: [
        'Books > Business & Money > Management & Leadership > Time Management',
        'Books > Self-Help > Personal Transformation',
        'Books > Crafts, Hobbies & Home > Crafts & Hobbies > Guided Journals',
      ],
      description: `<h3>Master Your Time and Achieve Your Biggest Goals</h3>\n<p>The <strong>${title}</strong> gives you a complete, distraction-free framework to organize your days, build rewarding habits, and achieve lasting momentum.</p>\n<ul>\n<li><strong>Print-Ready 6x9 Format:</strong> Comfortable writing space that slips easily into bags and backpacks.</li>\n<li><strong>Structured Habit Trackers:</strong> Keep consistency front-and-center every single month.</li>\n<li><strong>Uncluttered Grayscale Interior:</strong> Clean lines designed for any ballpoint, gel pen, or pencil without ink bleed.</li>\n</ul>`,
    },
  };
}

/**
 * Loads all projects from localStorage
 */
export function getSavedProjects(): PlannerProject[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // Seed with initial starter project
      const initial = createDefaultProject();
      saveProject(initial);
      return [initial];
    }
    const projects: PlannerProject[] = JSON.parse(raw);
    if (!Array.isArray(projects) || projects.length === 0) {
      const initial = createDefaultProject();
      saveProject(initial);
      return [initial];
    }
    return projects;
  } catch (err) {
    console.error('Failed to load projects from storage:', err);
    return [createDefaultProject()];
  }
}

/**
 * Saves or updates a project in localStorage
 */
export function saveProject(project: PlannerProject): void {
  try {
    const existing = getSavedProjects().filter((p) => p.id !== project.id);
    const updated = {
      ...project,
      pageCount: project.pages.length,
      updatedAt: new Date().toISOString(),
    };
    const combined = [updated, ...existing];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(combined));
    localStorage.setItem(ACTIVE_PROJECT_ID_KEY, project.id);
  } catch (err) {
    console.error('Failed to save project:', err);
  }
}

/**
 * Retrieves the currently active project
 */
export function getActiveProject(): PlannerProject {
  const projects = getSavedProjects();
  const activeId = localStorage.getItem(ACTIVE_PROJECT_ID_KEY);
  if (activeId) {
    const found = projects.find((p) => p.id === activeId);
    if (found) return found;
  }
  return projects[0];
}

/**
 * Sets the active project ID
 */
export function setActiveProjectId(id: string): void {
  localStorage.setItem(ACTIVE_PROJECT_ID_KEY, id);
}

/**
 * Deletes a project by ID
 */
export function deleteProject(id: string): PlannerProject[] {
  const current = getSavedProjects().filter((p) => p.id !== id);
  if (current.length === 0) {
    const newProj = createDefaultProject();
    current.push(newProj);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
  localStorage.setItem(ACTIVE_PROJECT_ID_KEY, current[0].id);
  return current;
}

/**
 * Duplicates an existing project
 */
export function duplicateProject(original: PlannerProject): PlannerProject {
  const copy: PlannerProject = {
    ...JSON.parse(JSON.stringify(original)),
    id: `project_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    name: `${original.name} (Copy)`,
    title: `${original.title} (Copy)`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  saveProject(copy);
  return copy;
}

/**
 * Exports project to downloadable JSON backup
 */
export function exportProjectToJson(project: PlannerProject): void {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(project, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `${project.name.replace(/\s+/g, '_')}_KDP_Project.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}
