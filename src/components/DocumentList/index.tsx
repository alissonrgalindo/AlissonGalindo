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
}

interface DocumentListProps {
  locale: Locale;
  dictionary: Dictionary;
}

export default function DocumentList({ locale, dictionary }: DocumentListProps) {
  const [documents, setDocuments] = useState<DocumentMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Carregar documentos ao montar o componente
  useEffect(() => {
    fetchDocuments();
  }, []);

  // Função para buscar documentos
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
      console.error("Erro ao buscar documentos:", err);
      setError(dictionary.documents.error);
    } finally {
      setLoading(false);
    }
  };

  // Função para excluir documento
  const deleteDocument = async (id: string) => {
    // Confirmação antes de excluir
    if (!confirm(dictionary.documents.deleteConfirm)) {
      return;
    }

    setDeleting(id);
    setMessage({ type: "", text: "" });
    
    try {
      const response = await fetch(`/api/documents/${id}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        throw new Error(locale === "pt-BR" 
          ? "Falha ao excluir documento" 
          : "Failed to delete document");
      }
      
      // Atualiza a lista removendo o documento
      setDocuments(documents.filter(doc => doc.id !== id));
      setMessage({ type: "success", text: dictionary.documents.deleteSuccess });
    } catch (err) {
      console.error("Erro ao excluir documento:", err);
      setMessage({ type: "error", text: dictionary.documents.deleteError });
    } finally {
      setDeleting(null);
    }
  };

  // Formatar data
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(locale, {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);
  };

  // Renderizar tipo do documento
  const renderDocumentType = (type: string) => {
    return dictionary.documents.typeLabels[type as keyof typeof dictionary.documents.typeLabels] || type;
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
      <h2 className="text-2xl font-bold mb-6">{dictionary.documents.listTitle}</h2>

      {message.text && (
        <div
          className={`p-4 mb-4 rounded-md ${
            message.type === "error"
              ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200"
              : "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200"
          }`}
        >
          {message.text}
        </div>
      )}

      {documents.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          {dictionary.documents.noDocuments}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-100 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {dictionary.documents.columns.title}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {dictionary.documents.columns.type}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {dictionary.documents.columns.source}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {dictionary.documents.columns.date}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {dictionary.documents.columns.chunks}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {dictionary.documents.columns.actions}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {documents.map((doc) => (
                <tr key={doc.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium">{doc.title}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      {renderDocumentType(doc.type)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {doc.source}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(doc.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {doc.chunk_count}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => deleteDocument(doc.id)}
                      disabled={deleting === doc.id}
                      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50"
                    >
                      {deleting === doc.id ? (
                        <span>...</span>
                      ) : (
                        dictionary.documents.deleteButton
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}