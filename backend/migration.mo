import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Text "mo:core/Text";
import Blob "mo:core/Blob";
import Storage "blob-storage/Storage";
import Array "mo:core/Array";

module {
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
    audioUrl : Text;
    audioMimeType : Text;
    audioMimeType2 : Text;
    quizQuestions : Text;
    flashcards : Text;
    createdAt : Int;
    audioBlob : ?Storage.ExternalBlob;
    audioBlobChunks : Map.Map<Nat, Blob>;
    audioBlobChunksTemp : Map.Map<Nat, Blob>;
    audioBlob2 : ?Storage.ExternalBlob;
    audioBlob2Chunks : Map.Map<Nat, Blob>;
    audioBlob2ChunksTemp : Map.Map<Nat, Blob>;
  };

  type OldActor = {
    chapters : Map.Map<Nat, OldChapter>;
    pdfEntries : Map.Map<Nat, {
      id : Nat;
      title : Text;
      entryType : Text;
      url : Text;
    }>;
    nextChapterId : Nat;
    nextPdfId : Nat;
  };

  type NewChapter = {
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
    createdAt : Int;
  };

  type NewActor = {
    chapters : Map.Map<Nat, NewChapter>;
    pdfEntries : Map.Map<Nat, {
      id : Nat;
      title : Text;
      entryType : Text;
      url : Text;
    }>;
    nextChapterId : Nat;
    nextPdfId : Nat;
  };

  public func run(old : OldActor) : NewActor {
    let newChapters = old.chapters.map<Nat, OldChapter, NewChapter>(
      func(_id, oldChapter) {
        {
          id = oldChapter.id;
          title = oldChapter.title;
          classNumber = oldChapter.classNumber;
          subject = oldChapter.subject;
          notesUrl = oldChapter.notesUrl;
          notesUrl1 = oldChapter.notesUrl1;
          notesLabel1 = oldChapter.notesLabel1;
          notesUrl2 = oldChapter.notesUrl2;
          notesLabel2 = oldChapter.notesLabel2;
          audioLabel1 = oldChapter.audioLabel1;
          audioLabel2 = oldChapter.audioLabel2;
          audioUrl1 = oldChapter.audioUrl;
          audioUrl2 = "";
          quizQuestions = oldChapter.quizQuestions;
          flashcards = oldChapter.flashcards;
          createdAt = oldChapter.createdAt;
        };
      }
    );
    {
      old with
      chapters = newChapters;
    };
  };
};
