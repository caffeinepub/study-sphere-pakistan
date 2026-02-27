import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Array "mo:core/Array";
import Time "mo:core/Time";
import Text "mo:core/Text";
import Blob "mo:core/Blob";
import Migration "migration";

import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";

// Use the with clause to enable data migration during canister upgrades
(with migration = Migration.run)
actor {
  include MixinStorage();

  public type Chapter = {
    id : Nat;
    title : Text;
    classNumber : Text;
    subject : Text;
    notesUrl : Text;
    notesUrl1 : Text;
    notesLabel1 : Text;
    notesUrl2 : Text;
    notesLabel2 : Text;
    audioLabel1 : Text;
    audioLabel2 : Text;
    audioUrl : Text;
    audioMimeType : Text;
    audioMimeType2 : Text;
    quizQuestions : Text; // JSON-serialized
    flashcards : Text; // JSON-serialized
    createdAt : Int;
    audioBlob : ?Storage.ExternalBlob;
    audioBlobChunks : Map.Map<Nat, Blob>;
    audioBlobChunksTemp : Map.Map<Nat, Blob>;
    audioBlob2 : ?Storage.ExternalBlob;
    audioBlob2Chunks : Map.Map<Nat, Blob>;
    audioBlob2ChunksTemp : Map.Map<Nat, Blob>;
  };

  public type ChapterSnapshot = {
    id : Nat;
    title : Text;
    classNumber : Text;
    subject : Text;
    notesUrl : Text;
    notesUrl1 : Text;
    notesLabel1 : Text;
    notesUrl2 : Text;
    notesLabel2 : Text;
    audioLabel1 : Text;
    audioLabel2 : Text;
    audioUrl : Text;
    audioMimeType : Text;
    audioMimeType2 : Text;
    quizQuestions : Text; // JSON-serialized
    flashcards : Text; // JSON-serialized
    createdAt : Int;
    audioBlob : ?Storage.ExternalBlob;
    audioBlob2 : ?Storage.ExternalBlob;
  };

  public type ChapterInput = {
    title : Text;
    classNumber : Text;
    subject : Text;
    notesUrl : Text;
    notesUrl1 : Text;
    notesLabel1 : Text;
    notesUrl2 : Text;
    notesLabel2 : Text;
    audioLabel1 : Text;
    audioLabel2 : Text;
    audioUrl : Text;
    audioMimeType : Text;
    audioMimeType2 : Text;
    quizQuestions : Text; // JSON-serialized
    flashcards : Text; // JSON-serialized
  };

  public type PdfEntry = {
    id : Nat;
    title : Text;
    entryType : Text;
    url : Text;
  };

  public type PdfEntryInput = {
    title : Text;
    entryType : Text;
    url : Text;
  };

  var nextChapterId = 1;
  var nextPdfId = 1;

  let chapters = Map.empty<Nat, Chapter>();
  let pdfEntries = Map.empty<Nat, PdfEntry>();

  public func addChapter(input : ChapterInput) : async Nat {
    let id = nextChapterId;
    let chapter : Chapter = {
      id;
      title = input.title;
      classNumber = input.classNumber;
      subject = input.subject;
      notesUrl = input.notesUrl;
      notesUrl1 = input.notesUrl1;
      notesLabel1 = input.notesLabel1;
      notesUrl2 = input.notesUrl2;
      notesLabel2 = input.notesLabel2;
      audioLabel1 = input.audioLabel1;
      audioLabel2 = input.audioLabel2;
      audioUrl = input.audioUrl;
      audioMimeType = input.audioMimeType;
      audioMimeType2 = input.audioMimeType2;
      quizQuestions = input.quizQuestions;
      flashcards = input.flashcards;
      createdAt = Time.now();
      audioBlob = null;
      audioBlobChunks = Map.empty<Nat, Blob>();
      audioBlobChunksTemp = Map.empty<Nat, Blob>();
      audioBlob2 = null;
      audioBlob2Chunks = Map.empty<Nat, Blob>();
      audioBlob2ChunksTemp = Map.empty<Nat, Blob>();
    };
    chapters.add(id, chapter);
    nextChapterId += 1;
    id;
  };

  public func updateChapter(id : Nat, input : ChapterInput) : async Bool {
    switch (chapters.get(id)) {
      case (null) { false };
      case (?existing) {
        let updated : Chapter = {
          existing with
          title = input.title;
          classNumber = input.classNumber;
          subject = input.subject;
          notesUrl = input.notesUrl;
          notesUrl1 = input.notesUrl1;
          notesLabel1 = input.notesLabel1;
          notesUrl2 = input.notesUrl2;
          notesLabel2 = input.notesLabel2;
          audioLabel1 = input.audioLabel1;
          audioLabel2 = input.audioLabel2;
          audioUrl = input.audioUrl;
          audioMimeType = input.audioMimeType;
          audioMimeType2 = input.audioMimeType2;
          quizQuestions = input.quizQuestions;
          flashcards = input.flashcards;
        };
        chapters.add(id, updated);
        true;
      };
    };
  };

  // Stable storage for audio (first audio file)
  public func uploadAudioChunk(chapterId : Nat, chunkIndex : Nat, totalChunks : Nat, data : Blob) : async Bool {
    switch (chapters.get(chapterId)) {
      case (null) { false };
      case (?chapter) {
        chapter.audioBlobChunksTemp.add(chunkIndex, data);

        if (chapter.audioBlobChunksTemp.size() == totalChunks) {
          chapter.audioBlobChunks.clear();
          let tempEntries = chapter.audioBlobChunksTemp.toArray();
          for ((index, chunk) in tempEntries.values()) {
            chapter.audioBlobChunks.add(index, chunk);
          };
          chapter.audioBlobChunksTemp.clear();
        };
        chapters.add(chapterId, chapter);
        true;
      };
    };
  };

  public func finalizeAudioUpload(chapterId : Nat, totalChunks : Nat) : async Bool {
    switch (chapters.get(chapterId)) {
      case (null) { false };
      case (?chapter) {
        if (chapter.audioBlobChunks.size() == totalChunks) {
          let allChunks = chapter.audioBlobChunks.values().toArray();
          var fullData = Blob.fromArray([]);

          for (chunk in allChunks.values()) {
            let fullDataArray = fullData.toArray();
            let chunkArray = chunk.toArray();
            let combinedArray = fullDataArray.concat(chunkArray);
            fullData := Blob.fromArray(combinedArray);
          };

          if (chapter.audioBlob == null) {
            let updatedChapter = { chapter with audioBlob = ?fullData };
            chapters.add(chapterId, updatedChapter);
          };

          chapter.audioBlobChunks.clear();
          chapter.audioBlobChunksTemp.clear();
          return true;
        };
        false;
      };
    };
  };

  public func getAudioData(chapterId : Nat) : async ?Blob {
    switch (chapters.get(chapterId)) {
      case (null) { null };
      case (?chapter) {
        switch (chapter.audioBlob) {
          case (null) { null };
          case (?data) { ?data };
        };
      };
    };
  };

  // Stable storage for second audio file (audioBlob2)
  public func uploadAudioChunk2(chapterId : Nat, chunkIndex : Nat, totalChunks : Nat, data : Blob) : async Bool {
    switch (chapters.get(chapterId)) {
      case (null) { false };
      case (?chapter) {
        chapter.audioBlob2ChunksTemp.add(chunkIndex, data);

        if (chapter.audioBlob2ChunksTemp.size() == totalChunks) {
          chapter.audioBlob2Chunks.clear();
          let tempEntries = chapter.audioBlob2ChunksTemp.toArray();
          for ((index, chunk) in tempEntries.values()) {
            chapter.audioBlob2Chunks.add(index, chunk);
          };
          chapter.audioBlob2ChunksTemp.clear();
        };
        chapters.add(chapterId, chapter);
        true;
      };
    };
  };

  public func finalizeAudioUpload2(chapterId : Nat, totalChunks : Nat) : async Bool {
    switch (chapters.get(chapterId)) {
      case (null) { false };
      case (?chapter) {
        if (chapter.audioBlob2Chunks.size() == totalChunks) {
          let allChunks = chapter.audioBlob2Chunks.values().toArray();
          var fullData = Blob.fromArray([]);

          for (chunk in allChunks.values()) {
            let fullDataArray = fullData.toArray();
            let chunkArray = chunk.toArray();
            let combinedArray = fullDataArray.concat(chunkArray);
            fullData := Blob.fromArray(combinedArray);
          };

          if (chapter.audioBlob2 == null) {
            let updatedChapter = { chapter with audioBlob2 = ?fullData };
            chapters.add(chapterId, updatedChapter);
          };

          chapter.audioBlob2Chunks.clear();
          chapter.audioBlob2ChunksTemp.clear();
          return true;
        };
        false;
      };
    };
  };

  public func getAudioData2(chapterId : Nat) : async ?Blob {
    switch (chapters.get(chapterId)) {
      case (null) { null };
      case (?chapter) {
        switch (chapter.audioBlob2) {
          case (null) { null };
          case (?data) { ?data };
        };
      };
    };
  };

  public func deleteAudioData(chapterId : Nat) : async Bool {
    switch (chapters.get(chapterId)) {
      case (null) { false };
      case (?chapter) {
        switch (chapter.audioBlob) {
          case (null) { false };
          case (?_) {
            let updatedChapter = { chapter with audioBlob = null };
            chapters.add(chapterId, updatedChapter);
            true;
          };
        };
      };
    };
  };

  public func deleteAudioData2(chapterId : Nat) : async Bool {
    switch (chapters.get(chapterId)) {
      case (null) { false };
      case (?chapter) {
        switch (chapter.audioBlob2) {
          case (null) { false };
          case (?_) {
            let updatedChapter = { chapter with audioBlob2 = null };
            chapters.add(chapterId, updatedChapter);
            true;
          };
        };
      };
    };
  };

  public func deleteChapter(id : Nat) : async Bool {
    switch (chapters.get(id)) {
      case (null) { false };
      case (?_) {
        chapters.remove(id);
        true;
      };
    };
  };

  public query ({ caller }) func getChapter(id : Nat) : async ?ChapterSnapshot {
    switch (chapters.get(id)) {
      case (null) { null };
      case (?chapter) { ?toChapterSnapshot(chapter) };
    };
  };

  public query ({ caller }) func getAllChapters() : async [ChapterSnapshot] {
    let chapterSnapshots = chapters.toArray().map(
      func((_, chapter)) { toChapterSnapshot(chapter) }
    );
    chapterSnapshots;
  };

  public func addPdfEntry(input : PdfEntryInput) : async Nat {
    let id = nextPdfId;
    let entry : PdfEntry = {
      id;
      title = input.title;
      entryType = input.entryType;
      url = input.url;
    };
    pdfEntries.add(id, entry);
    nextPdfId += 1;
    id;
  };

  public func updatePdfEntry(id : Nat, input : PdfEntryInput) : async Bool {
    switch (pdfEntries.get(id)) {
      case (null) { false };
      case (?existing) {
        let updated : PdfEntry = {
          existing with
          title = input.title;
          entryType = input.entryType;
          url = input.url;
        };
        pdfEntries.add(id, updated);
        true;
      };
    };
  };

  public func deletePdfEntry(id : Nat) : async Bool {
    switch (pdfEntries.get(id)) {
      case (null) { false };
      case (?_) {
        pdfEntries.remove(id);
        true;
      };
    };
  };

  public query ({ caller }) func getAllPdfEntries() : async [PdfEntry] {
    pdfEntries.values().toArray();
  };

  func toChapterSnapshot(chapter : Chapter) : ChapterSnapshot {
    {
      id = chapter.id;
      title = chapter.title;
      classNumber = chapter.classNumber;
      subject = chapter.subject;
      notesUrl = chapter.notesUrl;
      notesUrl1 = chapter.notesUrl1;
      notesLabel1 = chapter.notesLabel1;
      notesUrl2 = chapter.notesUrl2;
      notesLabel2 = chapter.notesLabel2;
      audioLabel1 = chapter.audioLabel1;
      audioLabel2 = chapter.audioLabel2;
      audioUrl = chapter.audioUrl;
      audioMimeType = chapter.audioMimeType;
      audioMimeType2 = chapter.audioMimeType2;
      quizQuestions = chapter.quizQuestions;
      flashcards = chapter.flashcards;
      createdAt = chapter.createdAt;
      audioBlob = chapter.audioBlob;
      audioBlob2 = chapter.audioBlob2;
    };
  };
};
