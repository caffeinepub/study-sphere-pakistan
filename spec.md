# Study Sphere Pakistan

## Current State
Chapters have content (notes, audio, quiz, flashcards, true/false) stored directly on the chapter record. Admin panel shows a flat list. ChapterPage shows content tabs. MDCAT section uses same structure.

## Requested Changes (Diff)

### Add
- Topic type in backend with all content fields (notesUrl1/2, labels, audioUrl1/2, quizQuestions, flashcards, trueFalseQuestions) plus chapterId reference
- Backend CRUD: addTopic, updateTopic, deleteTopic, getTopicsByChapter, getTopic
- New TopicPage at /topic/:topicId showing Notes/Audio/Quiz/Flashcards/T-F tabs
- Route /topic/:topicId in App.tsx

### Modify
- Chapter backend type: remove content fields, keep only id/title/classNumber/subject/createdAt
- ChapterPage (grade chapters): show list of topic buttons, clicking navigates to TopicPage. MDCAT chapters: unchanged.
- AdminPage: grade selector → subject selector → chapter list → edit chapter opens topic management (list + add/edit/delete topics). Add Chapter saves title+grade+subject only.
- ChapterForm: only title, classNumber, subject
- Add topic hooks and types

### Remove
- Content fields from Chapter type and ChapterForm

## Implementation Plan
1. Update main.mo - strip content from Chapter, add Topic CRUD
2. Update frontend types, mapper, hooks
3. Create TopicPage.tsx
4. Update ChapterPage.tsx for grade topic list
5. Update AdminPage.tsx with grade/subject/chapter/topic hierarchy
6. Update ChapterForm.tsx to title-only
7. Add TopicForm component
8. Register /topic/:topicId route
