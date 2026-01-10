"use client";

import { useEffect, useState } from "react";
import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { db } from "../services/firebase";

export function useMessages(chatId?: string | null) {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 🔒 IMPORTANT: reset when no chat
    if (!chatId) {
      setMessages([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const q = query(
      collection(db, "messages"),
      where("chatId", "==", chatId),
      orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(q, (snap) => {
      setMessages(
        snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }))
      );
      setLoading(false);
    });

    return unsubscribe;
  }, [chatId]);

  const addMessage = async (data: any) => {
    // 🔒 ABSOLUTELY REQUIRED
    if (!chatId) {
      console.warn("addMessage called without chatId");
      return;
    }

    await addDoc(collection(db, "messages"), {
      ...data,
      chatId,
      createdAt: serverTimestamp(),
    });
  };

  return { messages, addMessage, loading };
}
