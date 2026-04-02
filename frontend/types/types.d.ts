interface Note {
  id: string;
  title: string;
  body: string;
  slug: string;
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
  slug: string;
};

type ApiResponse<TData> = {
  success: boolean;
  messsage: string;
  error?: ApiError;
  data?: TData;
};

type ApiError = {
  code: string;
  errors: string;
};
