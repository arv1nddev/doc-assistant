const BASE_URL = process.env.NEXT_PUBLIC_CHATBOT_API_URL!;

export async function sendToChatbot(
  question: string,
  conversationId: string,
  fileUrl?: string | null,
  temperature?: number,
  enableSearch?: boolean
) {
  const requestBody: any = {
    question,
    conversation_id: conversationId,
    temperature: temperature ?? 0.7,
    enable_search: enableSearch ?? false,
  };

  const res = await fetch(`${BASE_URL}/query`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || "Chatbot API failed");
  }

  return res.json();
}

// Upload documents to the RAG system for indexing
export async function uploadDocument(file: File, userId: string) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("user_id", userId);

  const res = await fetch(`${BASE_URL}/upload`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || "Document upload failed");
  }

  return res.json();
}