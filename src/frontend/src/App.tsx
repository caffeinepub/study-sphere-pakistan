import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
  useRouterState,
} from "@tanstack/react-router";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import Footer from "./components/Footer";
import Header from "./components/Header";
import SplashScreen from "./components/SplashScreen";
import AdminPage from "./pages/AdminPage";
import ChapterPage from "./pages/ChapterPage";
import ClassPage from "./pages/ClassPage";
import HomePage from "./pages/HomePage";
import MDCATPage from "./pages/MDCATPage";
import MDCATSubjectPage from "./pages/MDCATSubjectPage";
import SubjectPage from "./pages/SubjectPage";
import SupportPage from "./pages/SupportPage";
import TermsPage from "./pages/TermsPage";
import TopicPage from "./pages/TopicPage";

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
      const stored = localStorage.getItem("darkMode");
      return stored === "true";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    try {
      localStorage.setItem("darkMode", String(isDark));
    } catch {
      // ignore
    }
  }, [isDark]);

  const toggleDark = () => setIsDark((prev) => !prev);

  return (
    <DarkModeContext.Provider value={{ isDark, toggleDark }}>
      {children}
    </DarkModeContext.Provider>
  );
}

const queryClient = new QueryClient();

function ScrollToTop() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const prevPathRef = useRef(pathname);

  useEffect(() => {
    if (prevPathRef.current !== pathname) {
      prevPathRef.current = pathname;
      window.scrollTo({ top: 0, behavior: "instant" });
    }
  }, [pathname]);

  return null;
}

function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-300">
      <ScrollToTop />
      <Header />
      <main className="flex-1 bg-background">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

const rootRoute = createRootRoute({ component: Layout });

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});
const classRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/class/$classNum",
  component: ClassPage,
});
const subjectRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/class/$classNum/$subject",
  component: SubjectPage,
});
const chapterRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/chapter/$chapterId",
  component: ChapterPage,
});
const topicRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/topic/$topicId",
  component: TopicPage,
});
const mdcatRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/mdcat",
  component: MDCATPage,
});
const mdcatSubjectRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/mdcat/$subject",
  component: MDCATSubjectPage,
});
const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: AdminPage,
});
const termsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/terms",
  component: TermsPage,
});
const supportRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/support",
  component: SupportPage,
});

const routeTree = rootRoute.addChildren([
  homeRoute,
  classRoute,
  subjectRoute,
  chapterRoute,
  topicRoute,
  mdcatRoute,
  mdcatSubjectRoute,
  adminRoute,
  termsRoute,
  supportRoute,
]);

const router = createRouter({ routeTree, scrollRestoration: false });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

function AppContent() {
  const [showSplash, setShowSplash] = useState(() => {
    try {
      return !sessionStorage.getItem("splashShown");
    } catch {
      return false;
    }
  });

  const handleSplashComplete = () => {
    try {
      sessionStorage.setItem("splashShown", "true");
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
