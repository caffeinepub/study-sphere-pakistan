import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Iter "mo:core/Iter";
import Time "mo:core/Time";

module {
  // Old types

  type OldChapter = {
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

  type OldPdfEntry = {
    id : Nat;
    title : Text;
    entryType : Text;
    url : Text;
  };

  type OldActor = {
    chapters : Map.Map<Nat, OldChapter>;
    pdfEntries : Map.Map<Nat, OldPdfEntry>;
    nextChapterId : Nat;
    nextPdfId : Nat;
  };

  // New types

  type NewChapter = {
    id : Nat;
    title : Text;
    classNumber : Text;
    subject : Text;
    createdAt : Int;
  };

  type NewPdfEntry = {
    id : Nat;
    title : Text;
    entryType : Text;
    url : Text;
  };

  type Topic = {
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

  type NewActor = {
    chapters : Map.Map<Nat, NewChapter>;
    pdfEntries : Map.Map<Nat, NewPdfEntry>;
    nextChapterId : Nat;
    nextPdfId : Nat;
    topics : Map.Map<Nat, Topic>;
    nextTopicId : Nat;
  };

  public func run(old : OldActor) : NewActor {
    let newChapters = old.chapters.map<Nat, OldChapter, NewChapter>(
      func(_id, oldChapter) {
        {
          id = oldChapter.id;
          title = oldChapter.title;
          classNumber = oldChapter.classNumber;
          subject = oldChapter.subject;
          createdAt = oldChapter.createdAt;
        };
      }
    );

    {
      chapters = newChapters;
      pdfEntries = old.pdfEntries;
      nextChapterId = old.nextChapterId;
      nextPdfId = old.nextPdfId;
      topics = Map.empty<Nat, Topic>();
      nextTopicId = 1;
    };
  };
};
