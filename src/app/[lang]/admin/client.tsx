"use client";

import { useState } from "react";
import { Locale } from "@/i18n/config";
import Chat from "@/components/Chat";
import UploadDocument from "@/components/UploadDocument";
import DocumentList from "@/components/DocumentList";
import DocumentInsights from "@/components/DocumentInsights";
import SmithTraceVisualizer from "@/components/SmithTraceVisualizer";
import { Dictionary } from "@/i18n/types";

interface AdminClientProps {
  lang: Locale;
  dictionary: Dictionary;
}

export default function AdminClient({ lang, dictionary }: AdminClientProps) {
  const [activeTab, setActiveTab] = useState<string>("chat");

  const tabs = [
    { id: "chat", label: dictionary.admin.tabs.chat },
    { id: "upload", label: dictionary.admin.tabs.upload },
    { id: "documents", label: dictionary.admin.tabs.documents },
    { id: "insights", label: "Document Insights" },
    { id: "traces", label: "LangChain Traces" },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          {dictionary.admin.title}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {dictionary.admin.description}
        </p>
      </header>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
        <ul className="flex flex-wrap -mb-px">
          {tabs.map((tab) => (
            <li key={tab.id} className="mr-2">
              <button
                onClick={() => setActiveTab(tab.id)}
                className={`inline-block py-2 px-4 text-sm font-medium ${
                  activeTab === tab.id
                    ? "text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400"
                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
              >
                {tab.label}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Tab Content */}
      <div className="space-y-8">
        {activeTab === "chat" && (
          <section className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-6">
              {dictionary.admin.tabs.chat}
            </h2>
            <Chat locale={lang} dictionary={dictionary} />
          </section>
        )}

        {activeTab === "upload" && (
          <section className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-6">
              {dictionary.admin.tabs.upload}
            </h2>
            <UploadDocument locale={lang} dictionary={dictionary} />
          </section>
        )}

        {activeTab === "documents" && (
          <section className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-6">
              {dictionary.admin.tabs.documents}
            </h2>
            <DocumentList locale={lang} dictionary={dictionary} />
          </section>
        )}

        {activeTab === "insights" && (
          <section className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-6">
              Document Insights
            </h2>
            <DocumentInsights locale={lang} dictionary={dictionary} />
          </section>
        )}

        {activeTab === "traces" && (
          <section className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-6">
              LangChain Traces
            </h2>
            <SmithTraceVisualizer locale={lang} dictionary={dictionary} />
          </section>
        )}
      </div>
    </div>
  );
}