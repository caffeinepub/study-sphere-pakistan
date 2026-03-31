import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Time "mo:core/Time";
import Text "mo:core/Text";
import MixinStorage "blob-storage/Mixin";



actor {
  include MixinStorage();

  // ── Legacy type (v1) kept for stable memory migration compatibility ────────
  type ChapterV1 = {
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
    audioUrl1 : Text;
    audioUrl2 : Text;
    quizQuestions : Text;
    flashcards : Text;
    trueFalseQuestions : Text;
    createdAt : Int;
  };

  // ── Current Chapter type (v2) with notesUrl3 / notesLabel3 ────────────────
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
    notesUrl3 : Text;
    notesLabel3 : Text;
    audioLabel1 : Text;
    audioLabel2 : Text;
    audioUrl1 : Text;
    audioUrl2 : Text;
    quizQuestions : Text;
    flashcards : Text;
    trueFalseQuestions : Text;
    createdAt : Int;
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
    notesUrl3 : Text;
    notesLabel3 : Text;
    audioLabel1 : Text;
    audioLabel2 : Text;
    audioUrl1 : Text;
    audioUrl2 : Text;
    quizQuestions : Text;
    flashcards : Text;
    trueFalseQuestions : Text;
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

  // OLD stable map — preserves existing data; read-only after migration
  let chapters = Map.empty<Nat, ChapterV1>();

  // NEW stable map — holds all chapters with the v2 schema
  let chaptersV2 = Map.empty<Nat, Chapter>();

  let pdfEntries = Map.empty<Nat, PdfEntry>();

  // Migration flag — ensures one-time migration of v1 -> v2 data
  var _chaptersV1Migrated = false;

  system func postupgrade() {
    if (not _chaptersV1Migrated) {
      for (v in chapters.values()) {
        chaptersV2.add(v.id, {
          id = v.id;
          title = v.title;
          classNumber = v.classNumber;
          subject = v.subject;
          notesUrl = v.notesUrl;
          notesUrl1 = v.notesUrl1;
          notesLabel1 = v.notesLabel1;
          notesUrl2 = v.notesUrl2;
          notesLabel2 = v.notesLabel2;
          notesUrl3 = "";
          notesLabel3 = "";
          audioLabel1 = v.audioLabel1;
          audioLabel2 = v.audioLabel2;
          audioUrl1 = v.audioUrl1;
          audioUrl2 = v.audioUrl2;
          quizQuestions = v.quizQuestions;
          flashcards = v.flashcards;
          trueFalseQuestions = v.trueFalseQuestions;
          createdAt = v.createdAt;
        });
      };
      _chaptersV1Migrated := true;
    };
  };

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
      notesUrl3 = input.notesUrl3;
      notesLabel3 = input.notesLabel3;
      audioLabel1 = input.audioLabel1;
      audioLabel2 = input.audioLabel2;
      audioUrl1 = input.audioUrl1;
      audioUrl2 = input.audioUrl2;
      quizQuestions = input.quizQuestions;
      flashcards = input.flashcards;
      trueFalseQuestions = input.trueFalseQuestions;
      createdAt = Time.now();
    };
    chaptersV2.add(id, chapter);
    nextChapterId += 1;
    id;
  };

  public func updateChapter(id : Nat, input : ChapterInput) : async Bool {
    switch (chaptersV2.get(id)) {
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
          notesUrl3 = input.notesUrl3;
          notesLabel3 = input.notesLabel3;
          audioLabel1 = input.audioLabel1;
          audioLabel2 = input.audioLabel2;
          audioUrl1 = input.audioUrl1;
          audioUrl2 = input.audioUrl2;
          quizQuestions = input.quizQuestions;
          flashcards = input.flashcards;
          trueFalseQuestions = input.trueFalseQuestions;
        };
        chaptersV2.add(id, updated);
        true;
      };
    };
  };

  public func deleteChapter(id : Nat) : async Bool {
    switch (chaptersV2.get(id)) {
      case (null) { false };
      case (?_) {
        chaptersV2.remove(id);
        true;
      };
    };
  };

  public query ({ caller }) func getChapter(id : Nat) : async ?Chapter {
    chaptersV2.get(id);
  };

  public query ({ caller }) func getAllChapters() : async [Chapter] {
    chaptersV2.values().toArray();
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
};
