import Array "mo:core/Array";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Time "mo:core/Time";
import Iter "mo:core/Iter";
import Migration "migration";
import MixinStorage "blob-storage/Mixin";
import Text "mo:core/Text";
import Order "mo:core/Order";

// with migration (applies migration).
(with migration = Migration.run)
actor {
  include MixinStorage();

  public type Chapter = {
    id : Nat;
    title : Text;
    classNumber : Text;
    subject : Text;
    createdAt : Int;
  };

  public type PdfEntry = {
    id : Nat;
    title : Text;
    entryType : Text;
    url : Text;
  };

  public type Topic = {
    id : Nat;
    chapterId : Nat;
    title : Text;
    notesUrl1 : Text;
    notesLabel1 : Text;
    notesUrl2 : Text;
    notesLabel2 : Text;
    audioUrl1 : Text;
    audioLabel1 : Text;
    audioUrl2 : Text;
    audioLabel2 : Text;
    quizQuestions : Text;
    flashcards : Text;
    trueFalseQuestions : Text;
    createdAt : Int;
  };

  public type TopicInput = {
    chapterId : Nat;
    title : Text;
    notesUrl1 : Text;
    notesLabel1 : Text;
    notesUrl2 : Text;
    notesLabel2 : Text;
    audioUrl1 : Text;
    audioLabel1 : Text;
    audioUrl2 : Text;
    audioLabel2 : Text;
    quizQuestions : Text;
    flashcards : Text;
    trueFalseQuestions : Text;
  };

  var nextChapterId = 1;
  var nextPdfId = 1;
  var nextTopicId = 1;

  let chapters = Map.empty<Nat, Chapter>();
  let pdfEntries = Map.empty<Nat, PdfEntry>();
  let topics = Map.empty<Nat, Topic>();

  // Chapter CRUD

  public shared ({ caller }) func addChapter(title : Text, classNumber : Text, subject : Text) : async Nat {
    let id = nextChapterId;
    let chapter : Chapter = {
      id;
      title;
      classNumber;
      subject;
      createdAt = Time.now(); // Use current time as createdAt
    };
    chapters.add(id, chapter);
    nextChapterId += 1;
    id;
  };

  public shared ({ caller }) func updateChapter(id : Nat, title : Text, classNumber : Text, subject : Text) : async Bool {
    switch (chapters.get(id)) {
      case (null) {
        false;
      };
      case (?existing) {
        let updated : Chapter = {
          existing with
          title;
          classNumber;
          subject;
        };
        chapters.add(id, updated);
        true;
      };
    };
  };

  public shared ({ caller }) func deleteChapter(id : Nat) : async Bool {
    switch (chapters.get(id)) {
      case (null) {
        false;
      };
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

  // PdfEntry CRUD

  public shared ({ caller }) func addPdfEntry(title : Text, entryType : Text, url : Text) : async Nat {
    let id = nextPdfId;
    let entry : PdfEntry = {
      id;
      title;
      entryType;
      url;
    };
    pdfEntries.add(id, entry);
    nextPdfId += 1;
    id;
  };

  public shared ({ caller }) func updatePdfEntry(id : Nat, title : Text, entryType : Text, url : Text) : async Bool {
    switch (pdfEntries.get(id)) {
      case (null) { false };
      case (?existing) {
        let updated : PdfEntry = {
          existing with
          title;
          entryType;
          url;
        };
        pdfEntries.add(id, updated);
        true;
      };
    };
  };

  public shared ({ caller }) func deletePdfEntry(id : Nat) : async Bool {
    switch (pdfEntries.get(id)) {
      case (null) {
        false;
      };
      case (?_) {
        pdfEntries.remove(id);
        true;
      };
    };
  };

  public query ({ caller }) func getPdfEntry(id : Nat) : async ?PdfEntry {
    pdfEntries.get(id);
  };

  public query ({ caller }) func getAllPdfEntries() : async [PdfEntry] {
    pdfEntries.values().toArray();
  };

  // Topic CRUD

  public shared ({ caller }) func addTopic(input : TopicInput) : async Nat {
    let id = nextTopicId;
    let topic : Topic = {
      id;
      chapterId = input.chapterId;
      title = input.title;
      notesUrl1 = input.notesUrl1;
      notesLabel1 = input.notesLabel1;
      notesUrl2 = input.notesUrl2;
      notesLabel2 = input.notesLabel2;
      audioUrl1 = input.audioUrl1;
      audioLabel1 = input.audioLabel1;
      audioUrl2 = input.audioUrl2;
      audioLabel2 = input.audioLabel2;
      quizQuestions = input.quizQuestions;
      flashcards = input.flashcards;
      trueFalseQuestions = input.trueFalseQuestions;
      createdAt = Time.now();
    };
    topics.add(id, topic);
    nextTopicId += 1;
    id;
  };

  public shared ({ caller }) func updateTopic(id : Nat, input : TopicInput) : async Bool {
    switch (topics.get(id)) {
      case (null) { false };
      case (?existing) {
        let updated : Topic = {
          existing with
          chapterId = input.chapterId;
          title = input.title;
          notesUrl1 = input.notesUrl1;
          notesLabel1 = input.notesLabel1;
          notesUrl2 = input.notesUrl2;
          notesLabel2 = input.notesLabel2;
          audioUrl1 = input.audioUrl1;
          audioLabel1 = input.audioLabel1;
          audioUrl2 = input.audioUrl2;
          audioLabel2 = input.audioLabel2;
          quizQuestions = input.quizQuestions;
          flashcards = input.flashcards;
          trueFalseQuestions = input.trueFalseQuestions;
        };
        topics.add(id, updated);
        true;
      };
    };
  };

  public shared ({ caller }) func deleteTopic(id : Nat) : async Bool {
    switch (topics.get(id)) {
      case (null) {
        false;
      };
      case (?_) {
        topics.remove(id);
        true;
      };
    };
  };

  public query ({ caller }) func getTopic(id : Nat) : async ?Topic {
    topics.get(id);
  };

  public query ({ caller }) func getTopicsByChapter(chapterId : Nat) : async [Topic] {
    topics.values().toArray().filter(func(t) { t.chapterId == chapterId });
  };

  public query ({ caller }) func getAllTopics() : async [Topic] {
    topics.values().toArray();
  };
};
