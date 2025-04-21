"use client";

import { useState } from "react";
import Image from "next/image";
import { Locale } from "@/i18n/config";
import { Dictionary } from "@/i18n/types";

interface UploadDocumentProps {
  locale: Locale;
  dictionary: Dictionary;
}

type DocumentType = "cv" | "portfolio" | "project" | "blog" | "github" | "linkedin" | "other";

export default function UploadDocument({ locale, dictionary }: UploadDocumentProps) {
  const [file, setFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState<DocumentType>("other");
  const [title, setTitle] = useState("");
  const [source, setSource] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Reset do formulário
  const resetForm = () => {
    setFile(null);
    setDocumentType("other");
    setTitle("");
    setSource("");
  };

  // Manipulador de upload de arquivo
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      
      // Define o título automaticamente se não houver um
      if (!title) {
        // Remove a extensão do arquivo para o título
        setTitle(selectedFile.name.replace(/\.[^/.]+$/, ""));
      }
    }
  };

  // Manipulador de envio
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      setMessage({ 
        type: "error", 
        text: locale === "pt-BR" 
          ? "Por favor, selecione um arquivo" 
          : "Please select a file" 
      });
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", documentType);
    formData.append("title", title || file.name);
    if (source) formData.append("source", source);

    setIsUploading(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await fetch("/api/documents/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || dictionary.documents.error);
      }

      setMessage({ type: "success", text: dictionary.documents.success });
      resetForm();
    } catch (error) {
      console.error("Erro ao enviar documento:", error);
      setMessage({ 
        type: "error", 
        text: error instanceof Error ? error.message : dictionary.documents.error
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-gray-50 dark:bg-gray-900 rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6">{dictionary.documents.uploadTitle}</h2>

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

      <form onSubmit={handleSubmit}>
        {/* Seleção de arquivo */}
        <div className="mb-4">
          <div
            className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-md p-6 flex flex-col items-center cursor-pointer"
            onClick={() => document.getElementById("file-upload")?.click()}
          >
            <input
              id="file-upload"
              type="file"
              className="hidden"
              onChange={handleFileChange}
              accept=".txt,.pdf,.doc,.docx,.md,.json,.csv"
            />
            
            <Image
              src="/file.svg"
              alt="Upload"
              width={48}
              height={48}
              className="mb-2"
            />
            
            {file ? (
              <p className="text-sm text-center">
                <span className="font-medium">{file.name}</span>{" "}
                ({(file.size / 1024).toFixed(1)} KB)
              </p>
            ) : (
              <p className="text-sm text-center text-gray-500 dark:text-gray-400">
                {locale === "pt-BR" 
                  ? "Clique para selecionar um arquivo ou arraste e solte"
                  : "Click to select a file or drag and drop"}
                <br />
                <span className="text-xs">
                  (.txt, .pdf, .doc, .docx, .md, .json, .csv)
                </span>
              </p>
            )}
          </div>
        </div>

        {/* Tipo de documento */}
        <div className="mb-4">
          <label htmlFor="document-type" className="block mb-2 text-sm font-medium">
            {dictionary.documents.typeLabel}
          </label>
          <select
            id="document-type"
            value={documentType}
            onChange={(e) => setDocumentType(e.target.value as DocumentType)}
            className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md dark:bg-gray-800"
            required
          >
            {Object.entries(dictionary.documents.typeLabels).map(([key, value]) => (
              <option key={key} value={key}>
                {value}
              </option>
            ))}
          </select>
        </div>

        {/* Nome do documento */}
        <div className="mb-4">
          <label htmlFor="document-title" className="block mb-2 text-sm font-medium">
            {dictionary.documents.nameLabel}
          </label>
          <input
            id="document-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md dark:bg-gray-800 dark:text-white"
            required
          />
        </div>

        {/* Fonte */}
        <div className="mb-6">
          <label htmlFor="document-source" className="block mb-2 text-sm font-medium">
            {dictionary.documents.sourceLabel}
          </label>
          <input
            id="document-source"
            type="text"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md dark:bg-gray-800 dark:text-white"
            placeholder={locale === "pt-BR" 
              ? "LinkedIn, GitHub, Website pessoal, etc."
              : "LinkedIn, GitHub, Personal website, etc."}
          />
        </div>

        {/* Botão de envio */}
        <button
          type="submit"
          disabled={isUploading || !file}
          className="w-full py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-blue-300 disabled:cursor-not-allowed"
        >
          {isUploading ? dictionary.documents.uploading : dictionary.documents.uploadButton}
        </button>
      </form>
    </div>
  );
}