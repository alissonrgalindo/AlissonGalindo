"use client";

import { Locale } from "@/i18n/config";
import Chat from "@/components/Chat";
import UploadDocument from "@/components/UploadDocument";
import DocumentList from "@/components/DocumentList";
import { Dictionary } from "@/i18n/types";

interface AdminClientProps {
  lang: Locale;
  dictionary: Dictionary;
}

export default function AdminClient({ lang, dictionary }: AdminClientProps) {
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

      <div className="space-y-8">
        <section className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-6">
            {dictionary.admin.tabs.chat}
          </h2>
          <Chat locale={lang} dictionary={dictionary} />
        </section>

        <section className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-6">
            {dictionary.admin.tabs.upload}
          </h2>
          <UploadDocument locale={lang} dictionary={dictionary} />
        </section>

        <section className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-6">
            {dictionary.admin.tabs.documents}
          </h2>
          <DocumentList locale={lang} dictionary={dictionary} />
        </section>
      </div>
    </div>
  );
}