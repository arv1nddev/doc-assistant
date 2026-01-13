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

  try {
    const res = await fetch(`${BASE_URL}/query`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      
      if (errorData.detail && typeof errorData.detail === 'string') {
        if (errorData.detail.includes('tool_use_failed') || errorData.detail.includes('Tool choice is none')) {
          throw new Error(
            'Web search configuration error. The backend needs to properly configure tool usage. ' +
            'Try disabling web search in the sidebar or contact the administrator.'
          );
        }
        throw new Error(errorData.detail);
      }
      
      throw new Error(`API Error (${res.status}): ${res.statusText}`);
    }

    return res.json();
  } catch (error: any) {
    if (error.message.includes('fetch')) {
      throw new Error('Cannot connect to the chatbot API. Please check if the backend is running.');
    }
    throw error;
  }
}

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

export async function deleteConversation(conversationId: string) {
  try {
    const res = await fetch(`${BASE_URL}/conversations/${conversationId}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.detail || "Failed to delete conversation from backend");
    }

    return res.json();
  } catch (error: any) {
    console.error("Error deleting conversation from backend:", error);
    return { success: false, error: error.message };
  }
}