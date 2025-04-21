"use client";

import { useState, useRef, useEffect } from "react";
import { Locale } from "@/i18n/config";
import { Dictionary } from "@/i18n/types";

export interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

interface ChatProps {
  locale: Locale;
  dictionary: Dictionary;
}

export default function Chat({ locale, dictionary }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Rolagem automática para o final da conversa
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Função para enviar mensagem
  const sendMessage = async () => {
    if (input.trim() === "") return;

    // Adiciona a mensagem do usuário ao estado
    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      // Chama a API de chat
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: input,
          conversationId,
          options: {
            retrievalEnabled: true,
            retrievalCount: 5,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Algo deu errado");
      }

      // Adiciona a resposta do assistente ao estado
      const assistantMessage: Message = {
        role: "assistant",
        content: data.message,
      };
      setMessages((prev) => [...prev, assistantMessage]);

      // Salva o ID da conversa para continuidade
      if (data.conversationId && !conversationId) {
        setConversationId(data.conversationId);
      }
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
      
      // Adiciona uma mensagem de erro
      const errorMessage: Message = {
        role: "assistant",
        content: "Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto h-[600px] bg-gray-50 dark:bg-gray-900 rounded-lg shadow-md flex flex-col">
      {/* Cabeçalho */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold">{dictionary.chat.title}</h2>
      </div>

      {/* Área de mensagens */}
      <div className="flex-1 p-4 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-400">
            <p>{locale === "pt-BR" 
              ? "Faça uma pergunta para começar a conversa."
              : "Ask a question to start the conversation."}</p>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              className={`mb-4 ${
                message.role === "user"
                  ? "text-right"
                  : "text-left"
              }`}
            >
              <div
                className={`inline-block max-w-[80%] px-4 py-2 rounded-lg ${
                  message.role === "user"
                    ? "bg-blue-500 text-white rounded-tr-none"
                    : "bg-gray-200 dark:bg-gray-700 dark:text-white rounded-tl-none"
                }`}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
              </div>
            </div>
          ))
        )}
        {loading && (
          <div className="text-left mb-4">
            <div className="inline-block max-w-[80%] px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 dark:text-white rounded-tl-none">
              <p>{dictionary.chat.loadingMessage}</p>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Área de input */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && sendMessage()}
            placeholder={dictionary.chat.placeholder}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
          <button
            onClick={sendMessage}
            disabled={loading || input.trim() === ""}
            className="px-4 py-2 bg-blue-500 text-white rounded-r-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-blue-300 disabled:cursor-not-allowed"
          >
            {dictionary.chat.sendButton}
          </button>
        </div>
      </div>
    </div>
  );
}