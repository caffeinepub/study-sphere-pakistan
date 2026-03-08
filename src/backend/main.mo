import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Array "mo:core/Array";
import Time "mo:core/Time";
import Text "mo:core/Text";
import MixinStorage "blob-storage/Mixin";



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
    audioUrl1 : Text;
    audioUrl2 : Text;
    quizQuestions : Text; // JSON-serialized
    flashcards : Text; // JSON-serialized
    trueFalseQuestions : Text; // New field
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
    audioLabel1 : Text;
    audioLabel2 : Text;
    audioUrl1 : Text;
    audioUrl2 : Text;
    quizQuestions : Text; // JSON-serialized
    flashcards : Text; // JSON-serialized
    trueFalseQuestions : Text; // New field
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
      audioUrl1 = input.audioUrl1;
      audioUrl2 = input.audioUrl2;
      quizQuestions = input.quizQuestions;
      flashcards = input.flashcards;
      trueFalseQuestions = input.trueFalseQuestions;
      createdAt = Time.now();
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
          audioUrl1 = input.audioUrl1;
          audioUrl2 = input.audioUrl2;
          quizQuestions = input.quizQuestions;
          flashcards = input.flashcards;
          trueFalseQuestions = input.trueFalseQuestions;
        };
        chapters.add(id, updated);
        true;
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

  public query ({ caller }) func getChapter(id : Nat) : async ?Chapter {
    chapters.get(id);
  };

  public query ({ caller }) func getAllChapters() : async [Chapter] {
    chapters.values().toArray();
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
