export async function getAIResponse(
  prompt: string, 
  history: { role: string, content: string }[], 
  studentContext: string, 
  timetable: string,
  customSystemInstruction?: string
) {
  try {
    const res = await fetch("/api/mentor/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, history, studentContext, timetable, customSystemInstruction }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `HTTP error ${res.status}`);
    }
    const data = await res.json();
    return data.text || "I am processing your request. Please hold.";
  } catch (error: any) {
    console.error("Client AI Proxy Error:", error);
    throw error;
  }
}

export async function gradeSubmission(sub: { title: string, type: string, moduleId: string, studentName: string, fileUrl?: string }) {
  try {
    const res = await fetch("/api/submission/grade", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sub }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `HTTP error ${res.status}`);
    }
    return await res.json();
  } catch (error: any) {
    console.error("Client Grading Proxy Error:", error);
    throw error;
  }
}

export async function gradeExam(examContext: any) {
  try {
    const res = await fetch("/api/exam/grade", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ examContext }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `HTTP error ${res.status}`);
    }
    return await res.json();
  } catch (error: any) {
    console.error("Client Exam Grading Proxy Error:", error);
    throw error;
  }
}

export async function generateMarketingAd(brief?: string) {
  return {
    title: "SYNTHETIC INTELLIGENCE",
    category: "ELITE CORE",
    description: "Break the barrier. Enter the 1%. ITA is the forge where masters of the digital realm are born.",
    visualPrompt: "Cybernetic eye reflecting flowing code in a high-tech lab"
  };
}
