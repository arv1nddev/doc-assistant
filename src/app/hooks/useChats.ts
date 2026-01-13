"use client";

import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  where,
  deleteDoc,
  updateDoc,
  doc,
  getDocs,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../services/firebase";
import { deleteConversation as deleteConversationFromBackend } from "../services/chatbot";

export function useChats(userId?: string) {
  const [chats, setChats] = useState<any[]>([]);

  useEffect(() => {
    if (!userId) return;

    const q = query(
      collection(db, "chats"),
      where("userId", "==", userId),
      orderBy("updatedAt", "desc")
    );

    return onSnapshot(q, (snap) => {
      setChats(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
  }, [userId]);

  const createChat = async () => {
    const ref = await addDoc(collection(db, "chats"), {
      userId,
      title: "New Chat",
      updatedAt: serverTimestamp(),
    });
    return ref.id;
  };

  const updateChat = async (id: string, data: any) =>
    updateDoc(doc(db, "chats", id), {
      ...data,
      updatedAt: serverTimestamp(),
    });

  const deleteChat = async (chatId: string) => {
    try {
      // await deleteConversationFromBackend(chatId);

      const messagesQuery = query(
        collection(db, "messages"),
        where("chatId", "==", chatId)
      );
      const messagesSnapshot = await getDocs(messagesQuery);
      const deletePromises = messagesSnapshot.docs.map((doc) =>
        deleteDoc(doc.ref)
      );
      await Promise.all(deletePromises);

      await deleteDoc(doc(db, "chats", chatId));

      console.log(`✅ Chat ${chatId} deleted successfully`);
    } catch (error) {
      console.error("Error deleting chat:", error);
      throw error;
    }
  };

  const togglePin = async (chatId: string, pinned: boolean) => {
    await updateDoc(doc(db, "chats", chatId), {
      pinned,
    });
  };

  return { chats, loading: false, createChat, updateChat, deleteChat, togglePin };
}