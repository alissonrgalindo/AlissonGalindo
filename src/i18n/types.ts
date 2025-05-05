export interface DocumentTypeLabels {
  cv: string;
  portfolio: string;
  project: string;
  blog: string;
  github: string;
  linkedin: string;
  other: string;
}

export interface DocumentColumns {
  title: string;
  type: string;
  source: string;
  date: string;
  chunks: string;
  actions: string;
}

export interface DocumentsDictionary {
  title: string;
  listTitle: string;
  uploadTitle: string;
  typeLabel: string;
  nameLabel: string;
  sourceLabel: string;
  uploadButton: string;
  uploading: string;
  success: string;
  error: string;
  noDocuments: string;
  loading: string;
  deleteButton: string;
  deleteConfirm: string;
  deleteSuccess: string;
  deleteError: string;
  typeLabels: DocumentTypeLabels;
  columns: DocumentColumns;
}

export interface ChatDictionary {
  title: string;
  placeholder: string;
  sendButton: string;
  loadingMessage: string;
}

export interface AdminTabs {
  chat: string;
  upload: string;
  documents: string;
}

export interface AdminDictionary {
  title: string;
  description: string;
  tabs: AdminTabs;
}

export interface NavbarDictionary {
  home: string;
  admin: string;
}

export interface AccessibilityDictionary {
  photoAlt: string;
  linkedinTitle: string;
  codepenTitle: string;
}

export interface HeroDictionary {
  title: string;
  subtitle: string;
  description: string;
  codepenLink: string;
  codepenLinkText: string;
  linkedinLink: string;
  orText: string;
  downloadCV: string;
  location: string;
}

export interface MetaDictionary {
  title: string;
  description: string;
}

export interface Dictionary {
  hero: HeroDictionary;
  meta: MetaDictionary;
  accessibility: AccessibilityDictionary;
  navbar: NavbarDictionary;
  chat: ChatDictionary;
  documents: DocumentsDictionary;
  admin: AdminDictionary;
}