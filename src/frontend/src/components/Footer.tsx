import { useNavigate } from "@tanstack/react-router";
import { BookOpen, Heart } from "lucide-react";

export default function Footer() {
  const navigate = useNavigate();
  const year = new Date().getFullYear();
  const appId = encodeURIComponent(window.location.hostname || "studyhub-app");

  return (
    <footer className="bg-white dark:bg-card border-t border-gray-200 dark:border-gray-600 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 font-heading font-bold text-lg text-primary dark:text-blue-400 mb-3">
              <BookOpen className="w-5 h-5" />
              <span>StudyHub</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Your complete study companion for FSc and MDCAT preparation.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-heading font-semibold text-gray-900 dark:text-white mb-3">
              Quick Links
            </h3>
            <ul className="space-y-2">
              {[
                { label: "Class 9", path: "/class/9" },
                { label: "Class 10", path: "/class/10" },
                { label: "Class 11", path: "/class/11" },
                { label: "Class 12", path: "/class/12" },
                { label: "MDCAT Prep", path: "/mdcat" },
                { label: "Support Us", path: "/support" },
                { label: "Terms & Conditions", path: "/terms" },
              ].map((link) => (
                <li key={link.path}>
                  <button
                    type="button"
                    onClick={() => navigate({ to: link.path })}
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-blue-400 transition-colors duration-200"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-heading font-semibold text-gray-900 dark:text-white mb-3">
              Legal
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Content is for educational purposes only. Not affiliated with any
              board.
            </p>
            <button
              type="button"
              onClick={() => navigate({ to: "/terms" })}
              className="text-sm text-primary dark:text-blue-400 hover:underline"
            >
              Read Terms & Conditions
            </button>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-600 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            © {year} StudyHub. All rights reserved.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
            Built with <Heart className="w-4 h-4 text-red-500 fill-red-500" />{" "}
            using{" "}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${appId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary dark:text-blue-400 hover:underline font-medium"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
