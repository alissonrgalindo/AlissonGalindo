import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { generateEmbeddings } from './embeddingService';
import { createAdminClient } from './supabaseClient';
import { v4 as uuidv4 } from 'uuid';


export type DocumentType = 'cv' | 'portfolio' | 'project' | 'blog' | 'github' | 'linkedin' | 'other';


export interface DocumentMetadata {
  document_id: string;
  title: string;
  type: DocumentType;
  source: string;
  chunk_index: number;
}


export interface PersonalInfo {
  name: string;
  title: string;
  location: string;
  email?: string;
  website?: string;
  linkedin?: string;
  github?: string;
  summary: string;
}

export interface Experience {
  title: string;
  company: string;
  start_date: string;
  end_date?: string;
  location?: string;
  description?: string;
  highlights?: string[];
  technologies?: string[];
}

export interface Education {
  degree: string;
  field: string;
  institution: string;
  start_date: string;
  end_date?: string;
  location?: string;
  description?: string;
}

export interface Skill {
  name: string;
  category: string;
  proficiency: number;
  years_experience?: number;
}

export interface Project {
  name: string;
  description?: string;
  url?: string;
  repository?: string;
  technologies?: string[];
  highlights?: string[];
}

export interface CVData {
  personalInfo: PersonalInfo;
  experiences?: Experience[];
  education?: Education[];
  skills?: Skill[];
  projects?: Project[];
}


export async function processDocumentText(
  text: string,
  metadata: Omit<DocumentMetadata, 'chunk_index'>,
): Promise<{
  success: boolean;
  documentId?: string;
  chunkCount?: number;
  error?: string;
}> {
  try {
    
    const documentId = metadata.document_id || uuidv4();
    
    
    const supabase = createAdminClient();
    
    
    const { error: metadataError } = await supabase
      .from('documents_metadata')
      .upsert({
        id: documentId,
        title: metadata.title,
        type: metadata.type,
        source: metadata.source,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    
    if (metadataError) {
      throw new Error(`Error storing document metadata: ${metadataError.message}`);
    }
    
    
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });
    
    const docs = await textSplitter.createDocuments(
      [text],
      [{ ...metadata, document_id: documentId }]
    );
    
    
    for (let i = 0; i < docs.length; i++) {
      const doc = docs[i];
      const chunk = doc.pageContent;
      const chunkMetadata = { ...doc.metadata, chunk_index: i } as DocumentMetadata;
      
      
      const [embedding] = await generateEmbeddings([chunk]);
      
      
      const { error } = await supabase
        .from('documents')
        .insert({
          content: chunk,
          embedding,
          metadata: chunkMetadata,
        });
      
      if (error) {
        throw new Error(`Error storing document chunk: ${error.message}`);
      }
    }
    
    
    await supabase
      .from('documents_metadata')
      .update({ 
        chunk_count: docs.length,
        updated_at: new Date().toISOString()
      })
      .eq('id', documentId);
    
    return {
      success: true,
      documentId,
      chunkCount: docs.length,
    };
  } catch (error) {
    console.error('Error processing document:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return {
      success: false,
      error: errorMessage,
    };
  }
}


export async function processCVData(cvData: CVData): Promise<{
  success: boolean;
  documentId?: string;
  chunkCount?: number;
  error?: string;
}> {
  try {
    
    const cvText = formatCVAsText(cvData);
    
    
    return await processDocumentText(
      cvText,
      {
        document_id: 'cv-main',
        title: 'Alison Galindo CV',
        type: 'cv',
        source: 'direct-input',
      }
    );
  } catch (error) {
    console.error('Error processing CV data:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return {
      success: false,
      error: errorMessage,
    };
  }
}


function formatCVAsText(cvData: CVData): string {
  const { personalInfo, experiences, education, skills, projects } = cvData;
  
  let text = `# ${personalInfo.name} - CV\n\n`;
  
  
  text += `## Personal Information\n`;
  text += `Name: ${personalInfo.name}\n`;
  text += `Title: ${personalInfo.title}\n`;
  text += `Location: ${personalInfo.location}\n`;
  if (personalInfo.email) text += `Email: ${personalInfo.email}\n`;
  if (personalInfo.website) text += `Website: ${personalInfo.website}\n`;
  if (personalInfo.linkedin) text += `LinkedIn: ${personalInfo.linkedin}\n`;
  if (personalInfo.github) text += `GitHub: ${personalInfo.github}\n\n`;
  text += `Summary: ${personalInfo.summary}\n\n`;
  
  
  if (experiences && experiences.length) {
    text += `## Work Experience\n\n`;
    experiences.forEach((exp) => {
      text += `### ${exp.title} at ${exp.company}\n`;
      text += `Duration: ${formatDate(exp.start_date)} - ${exp.end_date ? formatDate(exp.end_date) : 'Present'}\n`;
      if (exp.location) text += `Location: ${exp.location}\n\n`;
      if (exp.description) text += `${exp.description}\n\n`;
      
      if (exp.highlights && exp.highlights.length > 0) {
        text += `Key Achievements:\n`;
        exp.highlights.forEach((highlight) => {
          text += `- ${highlight}\n`;
        });
        text += `\n`;
      }
      
      if (exp.technologies && exp.technologies.length > 0) {
        text += `Technologies: ${exp.technologies.join(', ')}\n\n`;
      }
    });
  }
  
  
  if (education && education.length) {
    text += `## Education\n\n`;
    education.forEach((edu) => {
      text += `### ${edu.degree} in ${edu.field}\n`;
      text += `Institution: ${edu.institution}\n`;
      text += `Duration: ${formatDate(edu.start_date)} - ${edu.end_date ? formatDate(edu.end_date) : 'Present'}\n`;
      if (edu.location) text += `Location: ${edu.location}\n\n`;
      
      if (edu.description) {
        text += `${edu.description}\n\n`;
      }
    });
  }
  
  
  if (skills && skills.length) {
    text += `## Skills\n\n`;
    
    
    const skillsByCategory: Record<string, Skill[]> = {};
    skills.forEach((skill) => {
      if (!skillsByCategory[skill.category]) {
        skillsByCategory[skill.category] = [];
      }
      skillsByCategory[skill.category].push(skill);
    });
    
    
    for (const [category, categorySkills] of Object.entries(skillsByCategory)) {
      text += `### ${category}\n`;
      categorySkills.forEach((skill) => {
        text += `- ${skill.name} (${skill.proficiency}/5`;
        if (skill.years_experience) {
          text += `, ${skill.years_experience} years`;
        }
        text += `)\n`;
      });
      text += `\n`;
    }
  }
  
  
  if (projects && projects.length) {
    text += `## Projects\n\n`;
    projects.forEach((project) => {
      text += `### ${project.name}\n\n`;
      if (project.description) text += `${project.description}\n\n`;
      
      if (project.url) {
        text += `URL: ${project.url}\n`;
      }
      
      if (project.repository) {
        text += `Repository: ${project.repository}\n`;
      }
      
      if (project.technologies && project.technologies.length > 0) {
        text += `Technologies: ${project.technologies.join(', ')}\n\n`;
      }
      
      if (project.highlights && project.highlights.length > 0) {
        text += `Key Features:\n`;
        project.highlights.forEach((highlight) => {
          text += `- ${highlight}\n`;
        });
        text += `\n`;
      }
    });
  }
  
  return text;
}


function formatDate(dateString: string): string {
  if (!dateString) return 'N/A';
  
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
  });
}