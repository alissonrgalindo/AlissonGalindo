// src/components/DocumentInsights/index.tsx
"use client";

import { useState, useEffect } from "react";
import { Locale } from "@/i18n/config";
import { Dictionary } from "@/i18n/types";

interface DocumentMetadata {
  id: string;
  title: string;
  type: string;
  source: string;
  created_at: string;
  updated_at: string;
  chunk_count: number;
  extracted_metadata?: ExtractedEntities;
}

interface ExtractedEntities {
  technologies: string[];
  skills: string[];
  experiences: Experience[];
  projects: Project[];
  education: Education[];
}

interface Experience {
  company: string;
  title: string;
  startDate: string;
  endDate?: string;
  description?: string;
  technologies?: string[];
  yearsOfExperience?: number;
}

interface Project {
  name: string;
  description?: string;
  technologies?: string[];
  url?: string;
  repository?: string;
}

interface Education {
  institution: string;
  degree: string;
  field?: string;
  startDate: string;
  endDate?: string;
}

interface DocumentInsightsProps {
  locale: Locale;
  dictionary: Dictionary;
}

export default function DocumentInsights({ locale, dictionary }: DocumentInsightsProps) {
  const [documents, setDocuments] = useState<DocumentMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedDocument, setSelectedDocument] = useState<DocumentMetadata | null>(null);
  const [showTechCount, setShowTechCount] = useState<Record<string, number>>({});
  const [showSkillCount, setShowSkillCount] = useState<Record<string, number>>({});

  // Fetch documents on component mount
  useEffect(() => {
    fetchDocuments();
  }, []);

  // Calculate insights when documents change
  useEffect(() => {
    if (documents.length > 0) {
      calculateTechnologyCounts();
      calculateSkillCounts();
    }
  }, [documents]);

  // Fetch documents from the API
  const fetchDocuments = async () => {
    setLoading(true);
    setError("");
    
    try {
      const response = await fetch("/api/documents");
      
      if (!response.ok) {
        throw new Error(locale === "pt-BR" 
          ? "Falha ao buscar documentos" 
          : "Failed to fetch documents");
      }
      
      const data = await response.json();
      setDocuments(data.documents || []);
    } catch (err) {
      console.error("Error fetching documents:", err);
      setError(dictionary.documents.error);
    } finally {
      setLoading(false);
    }
  };
  
  // Calculate technology counts across all documents
  const calculateTechnologyCounts = () => {
    const techCounts: Record<string, number> = {};
    
    documents.forEach(doc => {
      if (doc.extracted_metadata?.technologies) {
        doc.extracted_metadata.technologies.forEach(tech => {
          techCounts[tech] = (techCounts[tech] || 0) + 1;
        });
      }
    });
    
    setShowTechCount(techCounts);
  };
  
  // Calculate skill counts across all documents
  const calculateSkillCounts = () => {
    const skillCounts: Record<string, number> = {};
    
    documents.forEach(doc => {
      if (doc.extracted_metadata?.skills) {
        doc.extracted_metadata.skills.forEach(skill => {
          skillCounts[skill] = (skillCounts[skill] || 0) + 1;
        });
      }
    });
    
    setShowSkillCount(skillCounts);
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(locale, {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);
  };
  
  // Handle document selection
  const handleSelectDocument = (doc: DocumentMetadata) => {
    setSelectedDocument(doc);
  };
  
  if (loading) {
    return (
      <div className="w-full max-w-6xl mx-auto bg-gray-50 dark:bg-gray-900 rounded-lg shadow-md p-6">
        <div className="flex justify-center items-center h-32">
          <p className="text-gray-500 dark:text-gray-400">{dictionary.documents.loading}</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="w-full max-w-6xl mx-auto bg-gray-50 dark:bg-gray-900 rounded-lg shadow-md p-6">
        <div className="bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200 p-4 rounded-md">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto bg-gray-50 dark:bg-gray-900 rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6">Document Insights</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Technology stats */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold mb-3">Technologies</h3>
          {Object.keys(showTechCount).length > 0 ? (
            <div className="space-y-2">
              {Object.entries(showTechCount)
                .sort(([, countA], [, countB]) => countB - countA)
                .slice(0, 10)
                .map(([tech, count]) => (
                  <div key={tech} className="flex justify-between items-center">
                    <span className="text-sm">{tech}</span>
                    <div className="flex items-center">
                      <div className="bg-blue-200 dark:bg-blue-700 h-4 rounded" 
                        style={{ width: `${Math.min(count * 20, 100)}px` }} />
                      <span className="ml-2 text-xs">{count}</span>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-sm">No technology data extracted</p>
          )}
        </div>
        
        {/* Skills stats */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold mb-3">Skills</h3>
          {Object.keys(showSkillCount).length > 0 ? (
            <div className="space-y-2">
              {Object.entries(showSkillCount)
                .sort(([, countA], [, countB]) => countB - countA)
                .slice(0, 10)
                .map(([skill, count]) => (
                  <div key={skill} className="flex justify-between items-center">
                    <span className="text-sm">{skill}</span>
                    <div className="flex items-center">
                      <div className="bg-green-200 dark:bg-green-700 h-4 rounded" 
                        style={{ width: `${Math.min(count * 20, 100)}px` }} />
                      <span className="ml-2 text-xs">{count}</span>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-sm">No skill data extracted</p>
          )}
        </div>
      </div>
      
      {/* Document list */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-3">Documents with Extracted Metadata</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-100 dark:bg-gray-800">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Tech Count
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Skills Count
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {documents.filter(doc => doc.extracted_metadata).map((doc) => (
                <tr key={doc.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="px-4 py-2 whitespace-nowrap text-sm">
                    {doc.title}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      {doc.type}
                    </span>
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm">
                    {doc.extracted_metadata?.technologies?.length || 0}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm">
                    {doc.extracted_metadata?.skills?.length || 0}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm">
                    {formatDate(doc.updated_at)}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-center text-sm">
                    <button
                      onClick={() => handleSelectDocument(doc)}
                      className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
              {documents.filter(doc => doc.extracted_metadata).length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                    No documents with extracted metadata found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Document details modal */}
      {selectedDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">{selectedDocument.title}</h3>
                <button 
                  onClick={() => setSelectedDocument(null)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  ✕
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Technologies */}
                <div>
                  <h4 className="font-semibold mb-2">Technologies</h4>
                  {selectedDocument.extracted_metadata?.technologies?.length ? (
                    <div className="flex flex-wrap gap-2">
                      {selectedDocument.extracted_metadata.technologies.map(tech => (
                        <span key={tech} className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-xs rounded-full">
                          {tech}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 text-sm">No technologies extracted</p>
                  )}
                </div>
                
                {/* Skills */}
                <div>
                  <h4 className="font-semibold mb-2">Skills</h4>
                  {selectedDocument.extracted_metadata?.skills?.length ? (
                    <div className="flex flex-wrap gap-2">
                      {selectedDocument.extracted_metadata.skills.map(skill => (
                        <span key={skill} className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-xs rounded-full">
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 text-sm">No skills extracted</p>
                  )}
                </div>
              </div>
              
              {/* Experiences */}
              <div className="mt-6">
                <h4 className="font-semibold mb-2">Experiences</h4>
                {selectedDocument.extracted_metadata?.experiences?.length ? (
                  <div className="space-y-4">
                    {selectedDocument.extracted_metadata.experiences.map((exp, idx) => (
                      <div key={idx} className="p-3 bg-gray-50 dark:bg-gray-700 rounded">
                        <p className="font-medium">{exp.title} at {exp.company}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {exp.startDate} - {exp.endDate || 'Present'}
                          {exp.yearsOfExperience && ` (${exp.yearsOfExperience} years)`}
                        </p>
                        {exp.description && <p className="text-sm mt-1">{exp.description}</p>}
                        {exp.technologies?.length > 0 && (
                          <div className="mt-2">
                            <p className="text-xs text-gray-500 dark:text-gray-400">Technologies:</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {exp.technologies.map(tech => (
                                <span key={tech} className="px-1.5 py-0.5 bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-200 text-xs rounded">
                                  {tech}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-sm">No experiences extracted</p>
                )}
              </div>
              
              {/* Projects */}
              <div className="mt-6">
                <h4 className="font-semibold mb-2">Projects</h4>
                {selectedDocument.extracted_metadata?.projects?.length ? (
                  <div className="space-y-4">
                    {selectedDocument.extracted_metadata.projects.map((project, idx) => (
                      <div key={idx} className="p-3 bg-gray-50 dark:bg-gray-700 rounded">
                        <p className="font-medium">{project.name}</p>
                        {project.description && <p className="text-sm mt-1">{project.description}</p>}
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                          {project.url && (
                            <a href={project.url} target="_blank" rel="noopener noreferrer" 
                              className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
                              Live Demo
                            </a>
                          )}
                          {project.repository && (
                            <a href={project.repository} target="_blank" rel="noopener noreferrer"
                              className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
                              Repository
                            </a>
                          )}
                        </div>
                        
                        {project.technologies?.length > 0 && (
                          <div className="mt-2">
                            <p className="text-xs text-gray-500 dark:text-gray-400">Technologies:</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {project.technologies.map(tech => (
                                <span key={tech} className="px-1.5 py-0.5 bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-200 text-xs rounded">
                                  {tech}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-sm">No projects extracted</p>
                )}
              </div>
              
              {/* Education */}
              <div className="mt-6">
                <h4 className="font-semibold mb-2">Education</h4>
                {selectedDocument.extracted_metadata?.education?.length ? (
                  <div className="space-y-4">
                    {selectedDocument.extracted_metadata.education.map((edu, idx) => (
                      <div key={idx} className="p-3 bg-gray-50 dark:bg-gray-700 rounded">
                        <p className="font-medium">{edu.degree}{edu.field ? ` in ${edu.field}` : ''}</p>
                        <p className="text-sm">{edu.institution}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {edu.startDate} - {edu.endDate || 'Present'}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-sm">No education information extracted</p>
                )}
              </div>
              
              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setSelectedDocument(null)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}