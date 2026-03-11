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
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "@tanstack/react-router";
import {
  AlertCircle,
  ArrowLeft,
  BookOpen,
  FileText,
  Loader2,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import ChapterForm from "../components/ChapterForm";
import PdfEntryForm from "../components/PdfEntryForm";
import TopicForm from "../components/TopicForm";
import {
  useDeleteChapter,
  useDeletePdfEntry,
  useDeleteTopic,
  useGetAllChapters,
  useGetAllPdfEntries,
  useGetTopicsByChapter,
} from "../hooks/useQueries";
import type { Chapter, PdfEntry, Topic } from "../types/chapter";

type AdminView =
  | "grades"
  | "subjects"
  | "chapterList"
  | "chapterDetail"
  | "addChapter"
  | "editChapter"
  | "addTopic"
  | "editTopic";

const GRADE_OPTIONS = [
  { value: "9", label: "9th Class", sub: "Matric Part 1" },
  { value: "10", label: "10th Class", sub: "Matric Part 2" },
  { value: "11", label: "11th Class", sub: "FSc Part 1" },
  { value: "12", label: "12th Class", sub: "FSc Part 2" },
];

const SUBJECTS_BY_GRADE: Record<string, string[]> = {
  "9": ["English", "Biology", "Chemistry", "Physics"],
  "10": ["English", "Biology", "Chemistry", "Physics"],
  "11": ["English", "Biology", "Chemistry", "Physics"],
  "12": ["English", "Biology", "Chemistry", "Physics"],
  MDCAT: ["Biology", "Chemistry", "Physics", "English", "Logical Reasoning"],
};

// ── Chapter Detail (shows topics list for a chapter) ──────────────────────────
function ChapterDetail({
  chapter,
  onBack,
  onAddTopic,
  onEditTopic,
}: {
  chapter: Chapter;
  onBack: () => void;
  onAddTopic: () => void;
  onEditTopic: (topic: Topic) => void;
}) {
  const { data: topics, isLoading } = useGetTopicsByChapter(chapter.id);
  const deleteTopic = useDeleteTopic();
  const topicList = topics ?? [];

  const handleDelete = async (topic: Topic) => {
    await deleteTopic.mutateAsync({ id: topic.id, chapterId: chapter.id });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          data-ocid="admin.chapter_detail.back.button"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-bold text-foreground truncate">
            {chapter.title}
          </h2>
          <p className="text-sm text-muted-foreground">
            Class {chapter.classNumber} · {chapter.subject}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground">Topics</h3>
        <Button
          size="sm"
          onClick={onAddTopic}
          data-ocid="admin.topic.open_modal_button"
        >
          <Plus className="w-4 h-4 mr-1" />
          Add Topic
        </Button>
      </div>

      {isLoading && (
        <div className="space-y-3" data-ocid="admin.topics.loading_state">
          {[...Array(3)].map((_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: skeletons
            <Skeleton key={i} className="h-14 w-full rounded-lg" />
          ))}
        </div>
      )}

      {!isLoading && topicList.length === 0 && (
        <div
          className="text-center py-10 text-muted-foreground"
          data-ocid="admin.topics.empty_state"
        >
          <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p>No topics yet. Add the first topic.</p>
        </div>
      )}

      {!isLoading && topicList.length > 0 && (
        <div className="space-y-2">
          {topicList.map((topic, i) => (
            <div
              key={topic.id}
              className="flex items-center gap-2 p-3 rounded-lg bg-card border border-border"
              data-ocid={`admin.topic.item.${i + 1}`}
            >
              <BookOpen className="w-4 h-4 text-primary shrink-0" />
              <span className="flex-1 font-medium text-foreground truncate min-w-0">
                {topic.title}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 h-8 w-8"
                onClick={() => onEditTopic(topic)}
                data-ocid={`admin.topic.edit_button.${i + 1}`}
              >
                <Pencil className="w-4 h-4" />
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0 h-8 w-8 text-destructive hover:text-destructive"
                    data-ocid={`admin.topic.delete_button.${i + 1}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Topic?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete "{topic.title}" and all its
                      content.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel data-ocid="admin.topic.cancel_button">
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleDelete(topic)}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      data-ocid="admin.topic.confirm_button"
                    >
                      {deleteTopic.isPending ? (
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
    </div>
  );
}

// ── Chapter List for a grade+subject ─────────────────────────────────────────
function ChapterList({
  chapters,
  grade,
  subject,
  onBack,
  onAdd,
  onEdit,
  onDetail,
}: {
  chapters: Chapter[];
  grade: string;
  subject: string;
  onBack: () => void;
  onAdd: () => void;
  onEdit: (chapter: Chapter) => void;
  onDetail: (chapter: Chapter) => void;
}) {
  const deleteChapter = useDeleteChapter();
  const filtered = chapters.filter(
    (ch) =>
      ch.classNumber === grade &&
      ch.subject.toLowerCase() === subject.toLowerCase(),
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          data-ocid="admin.chapter_list.back.button"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h2 className="text-lg font-bold text-foreground">{subject}</h2>
          <p className="text-sm text-muted-foreground">
            {grade === "MDCAT" ? "MDCAT" : `Class ${grade}`}
          </p>
        </div>
        <Button
          size="sm"
          onClick={onAdd}
          data-ocid="admin.chapter.open_modal_button"
        >
          <Plus className="w-4 h-4 mr-1" />
          Add Chapter
        </Button>
      </div>

      {filtered.length === 0 && (
        <div
          className="text-center py-10 text-muted-foreground"
          data-ocid="admin.chapters.empty_state"
        >
          <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p>No chapters yet. Add the first one.</p>
        </div>
      )}

      <div className="space-y-2">
        {filtered.map((ch, i) => (
          <div
            key={ch.id}
            className="flex items-center gap-2 p-3 rounded-lg bg-card border border-border"
            data-ocid={`admin.chapter.item.${i + 1}`}
          >
            <button
              type="button"
              onClick={() => onDetail(ch)}
              className="flex-1 flex items-center gap-3 min-w-0 text-left"
            >
              <BookOpen className="w-4 h-4 text-primary shrink-0" />
              <span className="font-medium text-foreground truncate">
                {ch.title}
              </span>
            </button>
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0 h-8 w-8"
              onClick={() => onEdit(ch)}
              data-ocid={`admin.chapter.edit_button.${i + 1}`}
            >
              <Pencil className="w-4 h-4" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0 h-8 w-8 text-destructive hover:text-destructive"
                  data-ocid={`admin.chapter.delete_button.${i + 1}`}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Chapter?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete "{ch.title}" and all its
                    topics.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel data-ocid="admin.chapter.cancel_button">
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => deleteChapter.mutateAsync(ch.id)}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    data-ocid="admin.chapter.confirm_button"
                  >
                    {deleteChapter.isPending ? (
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
    </div>
  );
}

// ── Main AdminPage ────────────────────────────────────────────────────────────
export default function AdminPage() {
  const navigate = useNavigate();
  const [view, setView] = useState<AdminView>("grades");
  const [selectedGrade, setSelectedGrade] = useState<string>("");
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null);
  const [detailChapter, setDetailChapter] = useState<Chapter | null>(null);
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);
  const [pdfView, setPdfView] = useState<"list" | "add" | "edit">("list");
  const [editingPdf, setEditingPdf] = useState<PdfEntry | null>(null);

  const { data: chapters, isLoading: chaptersLoading } = useGetAllChapters();
  const { data: pdfEntries, isLoading: pdfsLoading } = useGetAllPdfEntries();
  const deletePdfMutation = useDeletePdfEntry();

  const chapterList = chapters ?? [];
  const pdfList = pdfEntries ?? [];

  // ── Breadcrumb label ──────────────────────────────────────────────────────
  const getBreadcrumb = () => {
    if (view === "grades") return "Admin Panel";
    if (view === "subjects")
      return selectedGrade === "MDCAT" ? "MDCAT" : `Class ${selectedGrade}`;
    if (view === "chapterList")
      return `${selectedSubject} — ${selectedGrade === "MDCAT" ? "MDCAT" : `Class ${selectedGrade}`}`;
    if (view === "chapterDetail" && detailChapter) return detailChapter.title;
    if (view === "addChapter") return "Add Chapter";
    if (view === "editChapter") return "Edit Chapter";
    if (view === "addTopic") return "Add Topic";
    if (view === "editTopic") return "Edit Topic";
    return "Admin Panel";
  };

  // ── Navigation helpers ────────────────────────────────────────────────────
  const goToGrades = () => {
    setView("grades");
    setSelectedGrade("");
    setSelectedSubject("");
    setDetailChapter(null);
    setEditingChapter(null);
    setEditingTopic(null);
  };

  const goToSubjects = (grade: string) => {
    setSelectedGrade(grade);
    setView("subjects");
  };

  const goToChapterList = (subject: string) => {
    setSelectedSubject(subject);
    setView("chapterList");
  };

  const goToChapterDetail = (chapter: Chapter) => {
    setDetailChapter(chapter);
    setView("chapterDetail");
  };

  // ── Chapter views ─────────────────────────────────────────────────────────
  if (view === "addChapter" || view === "editChapter") {
    return (
      <div className="min-h-screen bg-background">
        <header className="bg-card border-b border-border sticky top-0 z-10">
          <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setView("chapterList");
                setEditingChapter(null);
              }}
              data-ocid="admin.back.button"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-bold text-foreground">
              {getBreadcrumb()}
            </h1>
          </div>
        </header>
        <main className="max-w-3xl mx-auto py-6">
          <ChapterForm
            chapter={editingChapter ?? undefined}
            onSuccess={() => {
              setView("chapterList");
              setEditingChapter(null);
            }}
            onCancel={() => {
              setView("chapterList");
              setEditingChapter(null);
            }}
          />
        </main>
      </div>
    );
  }

  // ── Topic views ───────────────────────────────────────────────────────────
  if ((view === "addTopic" || view === "editTopic") && detailChapter) {
    return (
      <div className="min-h-screen bg-background">
        <header className="bg-card border-b border-border sticky top-0 z-10">
          <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setView("chapterDetail");
                setEditingTopic(null);
              }}
              data-ocid="admin.back.button"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-bold text-foreground">
              {getBreadcrumb()}
            </h1>
          </div>
        </header>
        <main className="max-w-3xl mx-auto py-6">
          <TopicForm
            chapterId={detailChapter.id}
            topic={editingTopic ?? undefined}
            onSuccess={() => {
              setView("chapterDetail");
              setEditingTopic(null);
            }}
            onCancel={() => {
              setView("chapterDetail");
              setEditingTopic(null);
            }}
          />
        </main>
      </div>
    );
  }

  // ── Main layout with tabs ─────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate({ to: "/" })}
            data-ocid="admin.home.button"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold text-foreground">Admin Panel</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6">
        <Tabs defaultValue="chapters">
          <TabsList className="w-full mb-6 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
            <TabsTrigger
              value="chapters"
              className="flex-1 flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-white text-gray-600 dark:text-gray-100 transition-colors"
              data-ocid="admin.chapters.tab"
            >
              <BookOpen className="w-4 h-4" />
              Chapters
            </TabsTrigger>
            <TabsTrigger
              value="pdfs"
              className="flex-1 flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-white text-gray-600 dark:text-gray-100 transition-colors"
              data-ocid="admin.pdfs.tab"
            >
              <FileText className="w-4 h-4" />
              PDF Entries
            </TabsTrigger>
          </TabsList>

          {/* ── Chapters Tab ─────────────────────────────────────────────── */}
          <TabsContent value="chapters">
            {chaptersLoading ? (
              <div className="space-y-3" data-ocid="admin.loading_state">
                {[...Array(4)].map((_, i) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: skeletons
                  <Skeleton key={i} className="h-14 w-full rounded-lg" />
                ))}
              </div>
            ) : (
              <>
                {/* Grade selection */}
                {view === "grades" && (
                  <div className="space-y-4">
                    <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                      Select Grade
                    </h2>
                    <div className="grid grid-cols-2 gap-3">
                      {GRADE_OPTIONS.map((g) => (
                        <button
                          key={g.value}
                          type="button"
                          onClick={() => goToSubjects(g.value)}
                          className="p-4 rounded-xl bg-card border border-border hover:border-primary/50 hover:bg-primary/5 transition-all text-left"
                          data-ocid={"admin.grade.button"}
                        >
                          <p className="font-bold text-foreground">{g.label}</p>
                          <p className="text-xs text-muted-foreground">
                            {g.sub}
                          </p>
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => goToSubjects("MDCAT")}
                        className="p-4 rounded-xl bg-card border border-border hover:border-primary/50 hover:bg-primary/5 transition-all text-left col-span-2"
                        data-ocid="admin.grade.button"
                      >
                        <p className="font-bold text-foreground">MDCAT</p>
                        <p className="text-xs text-muted-foreground">
                          Medical entrance preparation
                        </p>
                      </button>
                    </div>
                  </div>
                )}

                {/* Subject selection */}
                {view === "subjects" && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={goToGrades}
                        data-ocid="admin.subjects.back.button"
                      >
                        <ArrowLeft className="w-5 h-5" />
                      </Button>
                      <h2 className="font-bold text-foreground">
                        {selectedGrade === "MDCAT"
                          ? "MDCAT"
                          : `Class ${selectedGrade}`}{" "}
                        — Select Subject
                      </h2>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {(SUBJECTS_BY_GRADE[selectedGrade] ?? []).map((subj) => (
                        <button
                          key={subj}
                          type="button"
                          onClick={() => goToChapterList(subj)}
                          className="p-4 rounded-xl bg-card border border-border hover:border-primary/50 hover:bg-primary/5 transition-all text-left"
                          data-ocid="admin.subject.button"
                        >
                          <p className="font-semibold text-foreground">
                            {subj}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Chapter list */}
                {view === "chapterList" && (
                  <ChapterList
                    chapters={chapterList}
                    grade={selectedGrade}
                    subject={selectedSubject}
                    onBack={() => setView("subjects")}
                    onAdd={() => {
                      setEditingChapter(null);
                      setView("addChapter");
                    }}
                    onEdit={(ch) => {
                      setEditingChapter(ch);
                      setView("editChapter");
                    }}
                    onDetail={goToChapterDetail}
                  />
                )}

                {/* Chapter detail (topics) */}
                {view === "chapterDetail" && detailChapter && (
                  <ChapterDetail
                    chapter={detailChapter}
                    onBack={() => setView("chapterList")}
                    onAddTopic={() => {
                      setEditingTopic(null);
                      setView("addTopic");
                    }}
                    onEditTopic={(t) => {
                      setEditingTopic(t);
                      setView("editTopic");
                    }}
                  />
                )}
              </>
            )}
          </TabsContent>

          {/* ── PDF Entries Tab ──────────────────────────────────────────── */}
          <TabsContent value="pdfs">
            {pdfView === "add" || pdfView === "edit" ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setPdfView("list");
                      setEditingPdf(null);
                    }}
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </Button>
                  <h2 className="font-bold text-foreground">
                    {pdfView === "edit" ? "Edit PDF Entry" : "Add PDF Entry"}
                  </h2>
                </div>
                <PdfEntryForm
                  pdfEntry={editingPdf ?? undefined}
                  onSuccess={() => {
                    setPdfView("list");
                    setEditingPdf(null);
                  }}
                  onCancel={() => {
                    setPdfView("list");
                    setEditingPdf(null);
                  }}
                />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-foreground">PDF Entries</h2>
                  <Button
                    size="sm"
                    onClick={() => setPdfView("add")}
                    data-ocid="admin.pdf.open_modal_button"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Entry
                  </Button>
                </div>

                {pdfsLoading && (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      // biome-ignore lint/suspicious/noArrayIndexKey: skeletons
                      <Skeleton key={i} className="h-14 w-full rounded-lg" />
                    ))}
                  </div>
                )}

                {!pdfsLoading && pdfList.length === 0 && (
                  <div
                    className="text-center py-10 text-muted-foreground"
                    data-ocid="admin.pdfs.empty_state"
                  >
                    <FileText className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p>No PDF entries yet.</p>
                  </div>
                )}

                <div className="space-y-2">
                  {pdfList.map((pdf, i) => (
                    <div
                      key={pdf.id}
                      className="flex items-center gap-2 p-3 rounded-lg bg-card border border-border"
                      data-ocid={`admin.pdf.item.${i + 1}`}
                    >
                      <FileText className="w-4 h-4 text-primary shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">
                          {pdf.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {pdf.entryType}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => {
                          setEditingPdf(pdf);
                          setPdfView("edit");
                        }}
                        data-ocid={`admin.pdf.edit_button.${i + 1}`}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            data-ocid={`admin.pdf.delete_button.${i + 1}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Delete PDF Entry?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete "{pdf.title}".
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() =>
                                deletePdfMutation.mutateAsync(pdf.id)
                              }
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
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
