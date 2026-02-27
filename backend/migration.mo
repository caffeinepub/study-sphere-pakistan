import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Storage "blob-storage/Storage";

module {
  type OldChapter = {
    id : Nat;
    title : Text;
    classNumber : Text;
    subject : Text;
    notesUrl : Text;
    audioUrl : Text;
    audioMimeType : Text;
    quizQuestions : Text;
    flashcards : Text;
    createdAt : Int;
  };

  type OldActor = {
    chapters : Map.Map<Nat, OldChapter>;
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

  type NewActor = {
    chapters : Map.Map<Nat, NewChapter>;
  };

  public func run(old : OldActor) : NewActor {
    let newChapters = old.chapters.map<Nat, OldChapter, NewChapter>(
      func(_id, oldChapter) {
        {
          oldChapter with
          notesUrl1 = "";
          notesLabel1 = "";
          notesUrl2 = "";
          notesLabel2 = "";
          audioLabel1 = "";
          audioLabel2 = "";
          audioMimeType2 = "";
          audioBlob = null;
          audioBlobChunks = Map.empty<Nat, Blob>();
          audioBlobChunksTemp = Map.empty<Nat, Blob>();
          audioBlob2 = null;
          audioBlob2Chunks = Map.empty<Nat, Blob>();
          audioBlob2ChunksTemp = Map.empty<Nat, Blob>();
        };
      }
    );
    { chapters = newChapters };
  };
};
