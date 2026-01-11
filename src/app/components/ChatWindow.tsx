"use client";

import MessageBubble from "./MessageBubble";
import ChatInput from "./ChatInput";
import { useMessages } from "../hooks/useMessages";
import { sendToChatbot, uploadDocument } from "../services/chatbot";
import { useAuth } from "../contexts/AuthContext";
import { MessageSquarePlus } from "lucide-react";

export default function ChatWindow({ 
  chatId, 
  onStartNewChat, 
  onUpdateChat,
  temperature,
  webSearch 
}: any) {
  const { messages, addMessage, updateMessage } = useMessages(chatId);
  const { user } = useAuth();

  if (!chatId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#0a0a0a]">
        <button
          onClick={onStartNewChat}
          className="
            group flex flex-col items-center gap-4
            px-10 py-8 rounded-2xl
            hover:bg-white/5
            transition-all duration-300
          "
        >
          <div
            className="
              flex items-center justify-center
              w-16 h-16 rounded-xl
              bg-indigo-600/90
              shadow-[0_0_30px_rgba(99,102,241,0.35)]
              group-hover:bg-indigo-500
              group-hover:shadow-[0_0_45px_rgba(99,102,241,0.55)]
              transition-all
            "
          >
            <MessageSquarePlus className="w-8 h-8 text-white" />
          </div>

          <div className="text-center space-y-1">
            <p className="text-base font-medium text-gray-200">
              New Chat
            </p>
            <p className="text-sm text-gray-500">
              Ask a question or explore an idea
            </p>
          </div>
        </button>
      </div>
    );
  }

  const handleSend = async (text: string, file?: File | null) => {
    if (!text.trim() && !file) return;

    // If there's a file, handle document upload first
    if (file && user) {
      try {
        // Add user message showing file upload
        const userMessage = text.trim() 
          ? `${text}\n\n📎 ${file.name}`
          : `📎 ${file.name}`;
        
        await addMessage({ 
          role: "user", 
          content: userMessage
        });

        // Update chat title if first message
        if (messages.length === 0) {
          const title = text.trim() || file.name;
          await onUpdateChat(chatId, {
            title: title.split(/\s+/).slice(0, 6).join(" "),
            updatedAt: new Date(),
          });
        }

        // Show uploading status
        const uploadingMessage = {
          role: "assistant",
          content: `_Uploading and indexing ${file.name}..._`,
          isThinking: true,
        };
        const uploadingRef = await addMessage(uploadingMessage);

        // Upload to RAG system
        const uploadResponse = await uploadDocument(file, user.uid);

        // Update with success message
        if (uploadingRef) {
          await updateMessage(uploadingRef.id, {
            content: `✓ **Document uploaded successfully!**\n\nFilename: ${uploadResponse.filename}\nSize: ${(uploadResponse.file_size / 1024).toFixed(2)} KB\nIndexed at: ${new Date(uploadResponse.timestamp).toLocaleString()}\n\n_Now querying the document..._`,
            isThinking: true,
          });
        }

        // Now query the uploaded document
        const questionText = text.trim() || "What is this document about? Please summarize its main content.";
        
        const response = await sendToChatbot(
          questionText, 
          chatId,
          null,
          temperature,
          webSearch
        );

        // Update with actual response
        if (uploadingRef) {
          await updateMessage(uploadingRef.id, {
            content: response.answer,
            isThinking: false,
          });
        }

      } catch (error: any) {
        console.error("Upload/Query error:", error);
        
        await addMessage({
          role: "assistant",
          content: `❌ **Error**: ${error.message}\n\nPlease try again or check if the file format is supported.`,
          isThinking: false,
        });
      }
      return;
    }

    // Text-only message (no file)
    await addMessage({ 
      role: "user", 
      content: text
    });

    // Update chat title if first message
    if (messages.length === 0) {
      const title = text.trim().split(/\s+/).slice(0, 6).join(" ");
      await onUpdateChat(chatId, {
        title,
        updatedAt: new Date(),
      });
    }

    // Show thinking message
    const thinkingMessage = {
      role: "assistant",
      content: "_Thinking…_",
      isThinking: true,
    };
    const thinkingRef = await addMessage(thinkingMessage);

    try {
      const response = await sendToChatbot(
        text, 
        chatId,
        null,
        temperature,
        webSearch
      );

      if (thinkingRef) {
        await updateMessage(thinkingRef.id, {
          content: response.answer,
          isThinking: false,
        });
      }
    } catch (error: any) {
      console.error("Chatbot error:", error);
      
      if (thinkingRef) {
        await updateMessage(thinkingRef.id, {
          content: `❌ **Error**: ${error.message}\n\nPlease try again.`,
          isThinking: false,
        });
      }
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#0a0a0a] relative">
      
      <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center opacity-40">
            <h1 className="text-4xl font-semibold text-gray-700 mb-2">
              Knowledge Vault
            </h1>
            <p className="text-gray-500">
              What would you like to work on?
            </p>
          </div>
        ) : (
          messages.map((m: any) => (
            <MessageBubble key={m.id} message={m} />
          ))
        )}
      </div>

      <div className="bg-[#0a0a0a] pb-2 pt-2 z-10">
        <ChatInput onSend={handleSend} />
      </div>
    </div>
  );
}