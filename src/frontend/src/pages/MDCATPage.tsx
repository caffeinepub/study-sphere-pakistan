import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "@tanstack/react-router";
import {
  AlertCircle,
  Atom,
  BookOpen,
  Brain,
  ExternalLink,
  FileText,
  FlaskConical,
  Languages,
  Loader2,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useDeletePdfEntry, useGetAllPdfEntries } from "../hooks/useQueries";
import type { PdfEntry } from "../types/chapter";

const subjects = [
  {
    label: "Biology",
    icon: FlaskConical,
    path: "/mdcat/biology",
    color: "text-green-600",
  },
  {
    label: "Chemistry",
    icon: Atom,
    path: "/mdcat/chemistry",
    color: "text-blue-600",
  },
  {
    label: "Physics",
    icon: Brain,
    path: "/mdcat/physics",
    color: "text-purple-600",
  },
  {
    label: "English",
    icon: Languages,
    path: "/mdcat/english",
    color: "text-orange-600",
  },
  {
    label: "Logical Reasoning",
    icon: Brain,
    path: "/mdcat/logical-reasoning",
    color: "text-pink-600",
  },
];

export default function MDCATPage() {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  const { data: pdfData, isLoading, isError } = useGetAllPdfEntries();
  const deletePdfMutation = useDeletePdfEntry();

  const pdfEntries: PdfEntry[] = pdfData ?? [];
  const pastPapers = pdfEntries.filter((e) => e.entryType === "past-paper");
  const practiceTests = pdfEntries.filter(
    (e) => e.entryType === "practice-test",
  );

  const handleDelete = async (id: string) => {
    await deletePdfMutation.mutateAsync(id);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate({ to: "/" })}
          >
            <BookOpen className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-foreground">MDCAT Prep</h1>
            <p className="text-sm text-muted-foreground">
              Medical & Dental College Admission Test
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-8">
        {/* Subject Navigation */}
        <section>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
            Subjects
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {subjects.map((s) => (
              <button
                key={s.path}
                type="button"
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: "instant" });
                  navigate({ to: s.path });
                }}
                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-card border border-border hover:border-primary/40 hover:bg-accent/30 transition-all"
              >
                <s.icon className={`w-6 h-6 ${s.color}`} />
                <span className="text-sm font-medium text-foreground">
                  {s.label}
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* Past Papers */}
        <section>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
            Past Papers
          </h2>

          {isLoading && (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: skeleton placeholders are positional
                <Skeleton key={i} className="h-14 w-full rounded-lg" />
              ))}
            </div>
          )}

          {isError && (
            <div className="flex items-center gap-2 text-destructive py-4 justify-center">
              <AlertCircle className="w-5 h-5" />
              <span>Failed to load entries.</span>
            </div>
          )}

          {!isLoading && !isError && pastPapers.length === 0 && (
            <p className="text-muted-foreground text-sm py-4">
              No past papers added yet.
            </p>
          )}

          {!isLoading && !isError && (
            <div className="space-y-2">
              {pastPapers.map((entry) => (
                <div
                  key={entry.id}
                  className="group flex items-center gap-3 px-4 py-3 rounded-lg bg-card border border-border hover:border-primary/40 transition-all"
                >
                  <FileText className="w-4 h-4 text-primary shrink-0" />
                  <span className="flex-1 font-medium text-foreground text-sm">
                    {entry.title}
                  </span>
                  <a
                    href={entry.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Entry</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{entry.title}"?
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(entry.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          {deletePdfMutation.isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            "Delete"
                          )}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Practice Tests */}
        <section>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
            Practice Tests
          </h2>

          {!isLoading && !isError && practiceTests.length === 0 && (
            <p className="text-muted-foreground text-sm py-4">
              No practice tests added yet.
            </p>
          )}

          {!isLoading && !isError && (
            <div className="space-y-2">
              {practiceTests.map((entry) => (
                <div
                  key={entry.id}
                  className="group flex items-center gap-3 px-4 py-3 rounded-lg bg-card border border-border hover:border-primary/40 transition-all"
                >
                  <FileText className="w-4 h-4 text-primary shrink-0" />
                  <span className="flex-1 font-medium text-foreground text-sm">
                    {entry.title}
                  </span>
                  <a
                    href={entry.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Entry</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{entry.title}"?
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(entry.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          {deletePdfMutation.isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            "Delete"
                          )}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
