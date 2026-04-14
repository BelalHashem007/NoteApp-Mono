interface Note {
  id: string;
  title: string;
  body: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
  tags: Tag[];
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

type FoldersWithTags = {
  Folders: FolderWithNotes[];
  Tags: Tag[];
};

type Tag = {
  id: string;
  name: string;
};

type SearchNotesResponse = {
  id: string;
  title: string;
  slug: string;
  snippet?: string;
  folderName: string;
  highLighted: {
    title?: {
      startIndex: number;
      endIndex: number;
    };
    body?: {
      startIndex: number;
      endIndex: number;
    };
  };
}[];

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

type LoginResponse = {
  user: {
    id: string;
    email: string;
    userName: string;
    fullName: string;
    roles: string[];
  };
  accessToken: string;
  accessTokenExpirationDate: string;
  refreshTokenExpiration: string;
  refreshToken: string;
};
