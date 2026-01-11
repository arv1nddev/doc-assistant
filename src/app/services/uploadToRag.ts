const BASE_URL = process.env.NEXT_PUBLIC_CHATBOT_API_URL!;

export async function uploadToRag(file: File, userId: string) {
  const formData = new FormData();
  formData.append("file", file);
  // formData.append("user_id", userId ?? "anonymous");

  const res = await fetch(`${BASE_URL}/upload`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || "Upload failed");
  }

  return res.json();
}
