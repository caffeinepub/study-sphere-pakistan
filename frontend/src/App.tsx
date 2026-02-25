import { RouterProvider, createRouter, createRoute, createRootRoute, Outlet } from '@tanstack/react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createContext, useContext, useEffect, useState } from 'react';
import HomePage from './pages/HomePage';
import ClassPage from './pages/ClassPage';
import SubjectPage from './pages/SubjectPage';
import ChapterPage from './pages/ChapterPage';
import MDCATPage from './pages/MDCATPage';
import MDCATSubjectPage from './pages/MDCATSubjectPage';
import AdminPage from './pages/AdminPage';
import TermsPage from './pages/TermsPage';
import SupportPage from './pages/SupportPage';
import SplashScreen from './components/SplashScreen';
import Header from './components/Header';
import Footer from './components/Footer';

// Dark Mode Context
interface DarkModeContextType {
  isDark: boolean;
  toggleDark: () => void;
}

export const DarkModeContext = createContext<DarkModeContextType>({
  isDark: false,
  toggleDark: () => {},
});

export function useDarkMode() {
  return useContext(DarkModeContext);
}

function DarkModeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(() => {
    try {
      const stored = localStorage.getItem('darkMode');
      return stored === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    try {
      localStorage.setItem('darkMode', String(isDark));
    } catch {
      // ignore
    }
  }, [isDark]);

  const toggleDark = () => setIsDark(prev => !prev);

  return (
    <DarkModeContext.Provider value={{ isDark, toggleDark }}>
      {children}
    </DarkModeContext.Provider>
  );
}

const queryClient = new QueryClient();

// Layout component
function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-300">
      <Header />
      <main className="flex-1 bg-background">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

// Routes
const rootRoute = createRootRoute({
  component: Layout,
});

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage,
});

const classRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/class/$classNum',
  component: ClassPage,
});

const subjectRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/class/$classNum/$subject',
  component: SubjectPage,
});

const chapterRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/chapter/$chapterId',
  component: ChapterPage,
});

const mdcatRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/mdcat',
  component: MDCATPage,
});

const mdcatSubjectRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/mdcat/$subject',
  component: MDCATSubjectPage,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  component: AdminPage,
});

const termsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/terms',
  component: TermsPage,
});

const supportRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/support',
  component: SupportPage,
});

const routeTree = rootRoute.addChildren([
  homeRoute,
  classRoute,
  subjectRoute,
  chapterRoute,
  mdcatRoute,
  mdcatSubjectRoute,
  adminRoute,
  termsRoute,
  supportRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

function AppContent() {
  const [showSplash, setShowSplash] = useState(() => {
    try {
      return !sessionStorage.getItem('splashShown');
    } catch {
      return false;
    }
  });

  const handleSplashComplete = () => {
    try {
      sessionStorage.setItem('splashShown', 'true');
    } catch {
      // ignore
    }
    setShowSplash(false);
  };

  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  return <RouterProvider router={router} />;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <DarkModeProvider>
        <AppContent />
      </DarkModeProvider>
    </QueryClientProvider>
  );
}
