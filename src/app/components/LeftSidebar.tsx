"use client";

import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";

import {
  MessageSquare,
  Plus,
  LogOut,
  MoreVertical,
  Pin,
  Trash2,
  User,
  AlertTriangle,
} from "lucide-react";

export default function LeftSidebar({
  chats,
  loading,
  currentChatId,
  onSelectChat,
  onNewChat,
  onDeleteChat,
  onTogglePin
}: any) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  
  const pinnedChats = chats.filter((c: any) => c.pinned);
  const recentChats = chats.filter((c: any) => !c.pinned);
  const { logout } = useAuth();

  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const handleDelete = async (chatId: string) => {
    setDeleting(true);
    try {
      await onDeleteChat(chatId);
      setDeleteConfirmId(null);
      setOpenMenuId(null);
      
      // show success message
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
    } catch (error) {
      console.error("Failed to delete chat:", error);
      alert("Failed to delete chat. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="w-64 bg-black border-r border-gray-800 flex flex-col h-screen text-gray-300">
      
      <div className="p-4">
        <button
          onClick={onNewChat}
          className="w-full flex items-center gap-3 px-4 py-3 bg-gray-900 hover:bg-gray-800 border border-gray-800 rounded-lg transition-all text-sm font-medium text-white"
        >
          <Plus className="w-5 h-5 text-indigo-500" />
          New Chat
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-2 space-y-1">
        {pinnedChats.length > 0 && (
          <>
            <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">
              Pinned
            </div>
            {pinnedChats.map((chat: any) => (
              <ChatRow
                key={chat.id}
                chat={chat}
                active={currentChatId === chat.id}
                onSelectChat={onSelectChat}
                openMenuId={openMenuId}
                setOpenMenuId={setOpenMenuId}
                onPin={() => onTogglePin(chat.id, !chat.pinned)}
                onDeleteClick={() => setDeleteConfirmId(chat.id)}
              />
            ))}
          </>
        )}

        <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">
          Recent
        </div>
        {recentChats.map((chat: any) => (
          <ChatRow
            key={chat.id}
            chat={chat}
            active={currentChatId === chat.id}
            onSelectChat={onSelectChat}
            openMenuId={openMenuId}
            setOpenMenuId={setOpenMenuId}
            onPin={() => onTogglePin(chat.id, !chat.pinned)}
            onDeleteClick={() => setDeleteConfirmId(chat.id)}
          />
        ))}
      </div>

      <div className="p-4 border-t border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white">
            <User className="w-4 h-4" />
          </div>
          <span className="text-sm text-gray-400">Account</span>
        </div>

        <button
          onClick={logout}
          className="text-gray-500 hover:text-red-400"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>

      {/* delete confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Delete Conversation?
                </h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  This will permanently delete this conversation, all messages, and any uploaded documents from the system. This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setDeleteConfirmId(null)}
                disabled={deleting}
                className="flex-1 px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                disabled={deleting}
                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Message */}
      {showSuccessMessage && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 animate-in slide-in-from-bottom-5 duration-300">
          <div className="bg-green-600 text-white px-6 py-3 rounded-lg shadow-2xl flex items-center gap-3 border border-green-500">
            <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="font-medium">Conversation deleted successfully</span>
          </div>
        </div>
      )}
    </div>
  );
}

function ChatRow({
  chat,
  active,
  onSelectChat,
  openMenuId,
  setOpenMenuId,
  onPin,
  onDeleteClick
}: any) {
  const isMenuOpen = openMenuId === chat.id;

  return (
    <div
      className={`group relative flex items-center gap-3 px-4 py-3 text-sm rounded-lg ${
        active
          ? "bg-indigo-600/10 text-indigo-400"
          : "hover:bg-gray-900 text-gray-400 hover:text-gray-200"
      }`}
    >
      <button
        onClick={() => onSelectChat(chat.id)}
        className="flex items-center gap-3 flex-1 text-left"
      >
        <MessageSquare className="w-4 h-4 shrink-0" />
        <span className="truncate">{chat.title || "New Conversation"}</span>
      </button>

      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpenMenuId(isMenuOpen ? null : chat.id);
        }}
        className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-gray-300"
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {isMenuOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setOpenMenuId(null)}
          />
          <div className="absolute right-2 top-10 z-20 w-36 bg-gray-900 border border-gray-800 rounded-lg shadow-lg overflow-hidden">
            <button
              onClick={() => {
                onPin();
                setOpenMenuId(null);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-800 text-gray-300 hover:text-white transition-colors"
            >
              <Pin className="w-4 h-4" />
              {chat.pinned ? "Unpin" : "Pin"}
            </button>
            <button
              onClick={() => {
                onDeleteClick();
                setOpenMenuId(null);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        </>
      )}
    </div>
  );
}