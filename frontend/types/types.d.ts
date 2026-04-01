interface Note {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  updatedAt: string;
}

interface Folder {
  id: string;
  folderName: string;
}

type FolderWithNotes = {
  id: string;
  folderName: string;
  notes: NoteWithoutBody[];
  createdAt: string;
  subFolders: FolderWithNotes[];
};

type NoteWithoutBody = {
  id: string;
  title: string;
};
