const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "AIzaSyD7xc2dDTV-e7UcED5P8cLQL4grqAjNNU0";

export const analyzeWellBeing = async (questions: any[], answers: Record<number, number>, profile?: any, history?: any[]) => {
    if (!API_KEY) {
        console.error("Gemini API Key is missing");
        throw new Error("API Key missing");
    }

    // Construct Prompt
    const prompt = `
    You are an expert AI psychologist specializing in workplace well-being.
    
    User Profile:
    Name: ${profile?.name || 'Employee'}
    Role: ${profile?.role || 'Team Member'}
    Age: ${profile?.age || 'Unknown'}
    
    History:
    Previous Scores: ${history?.map((h: any) => h.score).join(', ') || 'None'}

    Analyze the following employee survey responses based on the "Maslach Burnout Inventory" and "Job Satisfaction" principles.
    Context: 1=Strongly Disagree/Never, 5=Strongly Agree/Always.
    
    IMPORTANT SCORING RULES:
    - Questions about "drained", "worn out", "pressure" (IDs 1, 2, 3) are NEGATIVE. High score (5) = BAD (High Stress).
    - Other questions are POSITIVE. High score (5) = GOOD (High Well-being).
    - When calculating the overall "score", you MUST inverse the values for the negative questions.

    Questions & Answers:
    ${questions.map(q => `- [ID: ${q.id}] "${q.text}": ${answers[q.id] || 0}`).join('\n')}

    Output MUST be valid JSON with this schema:
    {
      "score": number (0-100 integer, overall well-being score),
      "risk": "Low" | "Medium" | "High",
      "metrics": {
        "focus": number (0-100 integer, Motivation/Focus level),
        "stress": number (0-100 integer, Stress level, higher is worse),
        "satisfaction": number (0-100 integer, Job Satisfaction level)
      },
      "summary": "2 sentences max. Address the user by name (${profile?.name || 'Employee'}). Refer to their role or history if relevant.",
      "recommendations": ["Actionable tip 1", "Actionable tip 2", "Actionable tip 3"]
    }
  `;

    try {
        // Direct fetch to avoid package version mismatch if any
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

        // Clean JSON
        const jsonStr = text.replace(/```json|```/g, '').trim();
        return JSON.parse(jsonStr);

    } catch (error) {
        console.error("AI Analysis Failed:", error);
        // Fallback Mock if AI fails
        // Simulation Mode (Offline/Fallback)
        console.log("Using Simulation Mode for Analysis");

        // Calculate raw scores with Polarity Correction
        // IDs 1, 2, 3 are Negative (Burnout indicators). 4-12 are Positive.
        const negativeIds = [1, 2, 3];
        let totalScore = 0;
        let maxPossibleScore = 0;

        Object.entries(answers).forEach(([qId, score]) => {
            const id = parseInt(qId);
            maxPossibleScore += 5;

            if (negativeIds.includes(id)) {
                // Inverse for Negative Questions: 5 becomes 1, 1 becomes 5.
                // Formula: (Max + Min) - Score => (5 + 1) - Score = 6 - Score
                totalScore += (6 - score);
            } else {
                totalScore += score;
            }
        });

        const normalizedScore = Math.round((totalScore / maxPossibleScore) * 100);

        // Derive metrics deterministically but with variety
        const stressLevel = Math.max(0, 100 - normalizedScore + (Math.random() * 10 - 5));
        const focusLevel = Math.min(100, normalizedScore + (Math.random() * 15 - 5));
        const satisfactionLevel = Math.min(100, normalizedScore + (Math.random() * 10));

        // Determine Risk Profile
        let risk: "Low" | "Medium" | "High";
        let summary: string;
        let recommendations: string[];

        // Adjusted thresholds for risk
        if (normalizedScore > 75) {
            risk = "Low";
            summary = `Excellent well-being! ${profile?.name || 'Employee'}, your engagement and satisfaction levels are inspiring.`;
            recommendations = [
                "Share your positive strategies with the team",
                "Maintain your work-life boundaries",
                "Consider mentoring peers to boost satisfaction"
            ];
        } else if (normalizedScore > 45) {
            risk = "Medium";
            summary = `You're doing okay ${profile?.name || 'Employee'}, but there are signs of emerging stress and fatigue.`;
            recommendations = [
                "Take regular micro-breaks tailored to your rhythm",
                "Discuss workload distribution with your manager",
                "Prioritize sleep hygiene this week"
            ];
        } else {
            risk = "High";
            summary = `Critical Alert: ${profile?.name || 'Employee'}, your responses indicate high burnout risk and exhaustion.`;
            recommendations = [
                "Immediate consultation with HR recommended",
                "Disconnect completely from work this weekend",
                "Review core responsibilities for reduction"
            ];
        }

        return {
            score: normalizedScore,
            risk: risk,
            metrics: {
                focus: Math.round(focusLevel),
                stress: Math.round(stressLevel),
                satisfaction: Math.round(satisfactionLevel)
            },
            summary: summary,
            recommendations: recommendations
        };
    }
};
