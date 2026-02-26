import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Array "mo:core/Array";
import Time "mo:core/Time";
import Text "mo:core/Text";



actor {
  public type Chapter = {
    id : Nat;
    title : Text;
    classNumber : Text;
    subject : Text;
    notesUrl : Text;
    audioUrl : Text;
    quizQuestions : Text; // JSON-serialized
    flashcards : Text; // JSON-serialized
    createdAt : Int;
  };

  public type ChapterInput = {
    title : Text;
    classNumber : Text;
    subject : Text;
    notesUrl : Text;
    audioUrl : Text;
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

  public shared ({ caller }) func addChapter(input : ChapterInput) : async Nat {
    let id = nextChapterId;
    let chapter : Chapter = {
      id;
      title = input.title;
      classNumber = input.classNumber;
      subject = input.subject;
      notesUrl = input.notesUrl;
      audioUrl = input.audioUrl;
      quizQuestions = input.quizQuestions;
      flashcards = input.flashcards;
      createdAt = Time.now();
    };
    chapters.add(id, chapter);
    nextChapterId += 1;
    id;
  };

  public shared ({ caller }) func updateChapter(id : Nat, input : ChapterInput) : async Bool {
    switch (chapters.get(id)) {
      case (null) { false };
      case (?existing) {
        let updated : Chapter = {
          existing with
          title = input.title;
          classNumber = input.classNumber;
          subject = input.subject;
          notesUrl = input.notesUrl;
          audioUrl = input.audioUrl;
          quizQuestions = input.quizQuestions;
          flashcards = input.flashcards;
        };
        chapters.add(id, updated);
        true;
      };
    };
  };

  public shared ({ caller }) func deleteChapter(id : Nat) : async Bool {
    switch (chapters.get(id)) {
      case (null) { false };
      case (?_) {
        chapters.remove(id);
        true;
      };
    };
  };

  public query ({ caller }) func getChapter(id : Nat) : async ?Chapter {
    chapters.get(id);
  };

  public query ({ caller }) func getAllChapters() : async [Chapter] {
    chapters.values().toArray();
  };

  public shared ({ caller }) func addPdfEntry(input : PdfEntryInput) : async Nat {
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

  public shared ({ caller }) func updatePdfEntry(id : Nat, input : PdfEntryInput) : async Bool {
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

  public shared ({ caller }) func deletePdfEntry(id : Nat) : async Bool {
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
