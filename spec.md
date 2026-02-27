# Specification

## Summary
**Goal:** Extend Study Sphere Pakistan with dual notes links and dual audio files per chapter (each with optional admin labels), add optimistic UI updates for chapter saves, and fix all text/background color contrast issues across light and dark mode.

**Planned changes:**
- Extend the Motoko backend `Chapter` record with `notesUrl1`, `notesLabel1`, `notesUrl2`, `notesLabel2`, `audioLabel1`, `audioLabel2`, and `audioMimeType2` fields, plus four new chunked audio functions for a second audio slot (`uploadAudioChunk2`, `finalizeAudioUpload2`, `getAudioData2`, `deleteAudioData2`) stored in stable variables
- Update `migration.mo` to migrate existing chapters to the new schema with empty-string defaults for all new fields
- Update the frontend `Chapter` TypeScript interface and `chapterMapper.ts` to include all new optional fields
- Add `uploadAudioFile2` utility in `audioUploadService.ts` for chunked upload of the second audio slot with progress callback
- Update `ChapterForm` in the admin panel to show two notes URL inputs (each with an optional label field) and two audio upload inputs (each with an optional label field, individual progress bars, and success/error messages); handle sequential audio uploads on save
- Update the Notes tab (`ChapterPage` / `NotesViewer`) to show named buttons for each available notes link using admin labels (fallback: "Notes 1" / "Notes 2")
- Update the Audio tab (`ChapterPage` / `AudioPlayer`) to show named buttons for each available audio slot using admin labels (fallback: "Audio 1" / "Audio 2"), fetching binary audio from the canister and playing via object URL; fall back to legacy `audioUrl` if no binary is stored
- Implement optimistic UI updates for chapter create/update in the admin panel using TanStack Query cache, with rollback and error display on failure
- Perform a full color contrast audit and fix across all pages and components in both light and dark mode using Tailwind `dark:` variant classes

**User-visible outcome:** Admins can add up to two notes links and two audio files per chapter with custom labels. Students see named buttons for each available notes/audio item. Chapter saves appear instant in the admin panel. All text is clearly visible against its background in both light and dark mode throughout the entire app.
