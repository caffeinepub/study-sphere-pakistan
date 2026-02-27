# Specification

## Summary
**Goal:** Replace chunked binary audio file uploads with simple URL/link inputs for both Audio 1 and Audio 2 slots across the frontend and backend.

**Planned changes:**
- Replace Audio 1 and Audio 2 file upload inputs in `ChapterForm.tsx` with plain text URL input fields (with placeholders accepting any link type) alongside their existing optional label fields; remove all file state, chunked-upload logic, progress bars, and audio upload service imports.
- Update the Save flow so chapter metadata (including `audioUrl1`, `audioUrl2`, `audioLabel1`, `audioLabel2`) is saved directly via `createChapter`/`updateChapter` with no audio upload steps.
- Update `ChapterPage.tsx` Audio tab to display named buttons/cards per available audio URL using admin-entered labels (fallback: 'Audio 1'/'Audio 2'), removing all `getAudioData`/`getAudioData2` calls and `URL.createObjectURL`/`URL.revokeObjectURL` logic.
- Update `AudioPlayer.tsx` to accept a URL string directly as its src, removing binary blob handling; show an error only if the browser cannot load the resource.
- Update `backend/main.mo` to add `audioUrl1` and `audioUrl2` as `Text` fields to `ChapterInput` and `Chapter` types, and remove all binary audio upload/finalize/retrieve canister functions.
- Update `chapter.ts` to add optional `audioUrl1?: string` and `audioUrl2?: string` fields and remove `hasAudio`/`hasAudio2` binary flags.
- Update `chapterMapper.ts` to map `audioUrl1` and `audioUrl2` from the backend and remove binary audio field references.

**User-visible outcome:** Admins can enter any audio URL (YouTube, Google Drive, direct link, etc.) for Audio 1 and Audio 2 when creating or editing a chapter. Students see labeled audio buttons on the Chapter page that play the stored URL directly, without any file upload or binary data fetching.
