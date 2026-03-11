import { useNavigate, useParams } from "@tanstack/react-router";
import {
  BookOpen,
  ChevronRight,
  FlaskConical,
  Microscope,
  Zap,
} from "lucide-react";
import { useEffect } from "react";

const subjects = [
  {
    id: "biology",
    label: "Biology",
    icon: Microscope,
    color: "bg-green-500 dark:bg-green-600",
    desc: "Cell biology, genetics, ecology and more",
  },
  {
    id: "chemistry",
    label: "Chemistry",
    icon: FlaskConical,
    color: "bg-blue-500 dark:bg-blue-600",
    desc: "Organic, inorganic and physical chemistry",
  },
  {
    id: "physics",
    label: "Physics",
    icon: Zap,
    color: "bg-yellow-500 dark:bg-yellow-600",
    desc: "Mechanics, waves, electricity and optics",
  },
  {
    id: "english",
    label: "English",
    icon: BookOpen,
    color: "bg-purple-500 dark:bg-purple-600",
    desc: "Grammar, comprehension and literature",
  },
];

export default function ClassPage() {
  const navigate = useNavigate();
  const { classNum } = useParams({ from: "/class/$classNum" });

  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll to top when page params change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classNum]);

  return (
    <div className="min-h-screen bg-background py-10 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 dark:bg-blue-800/40 text-primary dark:text-blue-300 text-sm font-medium mb-4">
            {classNum === "9"
              ? "Matric Part 1"
              : classNum === "10"
                ? "Matric Part 2"
                : classNum === "11"
                  ? "FSc Part 1"
                  : "FSc Part 2"}
          </div>
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-gray-900 dark:text-white mb-3">
            Class {classNum} Subjects
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Select a subject to browse chapters and study materials.
          </p>
        </div>

        {/* Subject Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {subjects.map((subject) => (
            <button
              key={subject.id}
              type="button"
              onClick={() => {
                window.scrollTo({ top: 0, behavior: "instant" });
                navigate({
                  to: "/class/$classNum/$subject",
                  params: { classNum, subject: subject.id },
                });
              }}
              className="flex items-center gap-4 p-6 bg-white dark:bg-card rounded-xl border border-gray-200 dark:border-gray-600 hover:border-primary dark:hover:border-blue-400 hover:shadow-md dark:hover:shadow-black/30 transition-all duration-200 text-left group"
            >
              <div
                className={`w-14 h-14 rounded-xl ${subject.color} flex items-center justify-center flex-shrink-0 shadow-md`}
              >
                <subject.icon className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-heading font-semibold text-gray-900 dark:text-white group-hover:text-primary dark:group-hover:text-blue-400 transition-colors">
                  {subject.label}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  {subject.desc}
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 dark:text-gray-500 group-hover:text-primary dark:group-hover:text-blue-400 transition-colors flex-shrink-0" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
