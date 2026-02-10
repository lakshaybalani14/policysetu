# Integrating Backboard API into PolicySetu

## What is Backboard API?
**Backboard API** is a powerful AI infrastructure tool that acts as a "brain" for your applications. It provides:
1.  **Universal LLM Routing:** Connect to 2,200+ AI models (like GPT-4, Claude, Llama) through a single API.
2.  **Long-term Memory:** It remembers user details, conversations, and context over time (unlike standard APIs that forget immediately).
3.  **State Management:** It can track where a user is in a process (e.g., "User is currently applying for PM-KISAN").

## Why Integrate it? (The "Extra Points" Factor 🌟)
Integrating Backboard would transform your simple `ChatWidget` into a **Smart AI Assistant**.
*   **Personalization:** The bot would remember "Oh, you asked about the Housing Scheme yesterday. Did you find the documents?"
*   **Complex Queries:** Instead of hardcoded responses, it can actually "read" your policy documents and answer specific questions.
*   **Cost Efficiency:** It routes simple "Hi" messages to cheaper models and complex "Am I eligible?" queries to smarter models.

---

## Integration Procedure

### 1. Prerequisites
*   Sign up at [backboard.io](https://backboard.io) (or their hackathon link) to get an **API Key**.
*   Create a **Project** in their dashboard.

### 2. Backend Setup (Recommended)
Since API keys should not be exposed in React frontend, use a Supabase Edge Function or a proxy.

**Create a Supabase Edge Function (`supabase/functions/chat/index.ts`):**
```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req) => {
  const { message, conversationId } = await req.json()
  
  const response = await fetch('https://api.backboard.io/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('BACKBOARD_API_KEY')}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: "gpt-4o-mini", // or routed-model
      messages: [{ role: "user", content: message }],
      memory_id: conversationId // This enables the "Memory" feature
    })
  })

  const data = await response.json()
  return new Response(JSON.stringify(data), { headers: { "Content-Type": "application/json" } })
})
```

### 3. Frontend Integration (`ChatWidget.jsx`)
Modify your `handleSendMessage` in `ChatWidget.jsx` to call this function instead of local logic.

```javascript
const handleSendMessage = async (e) => {
    // ... existing UI update code ...

    // Call Backboard API
    const response = await supabase.functions.invoke('chat', {
        body: { 
            message: inputText,
            conversationId: user?.id || 'guest_session' 
        }
    });

    // Display AI Response
    const botResponse = response.data.choices[0].message.content;
    setMessages(prev => [...prev, { text: botResponse, sender: 'bot' }]);
};
```

### 4. Advanced: RAG (Retrieval Augmented Generation)
You can upload your Policy PDF documents to Backboard. The API will then automatically search through your schemes to answer user questions accurately!

## Summary of Impact
| Feature | Without Backboard | With Backboard |
| :--- | :--- | :--- |
| **Intelligence** | Hardcoded if/else logic | True AI understanding |
| **Memory** | Forgets immediately | Remembers user context |
| **Scalability** | Limited to typed keywords | Can handle any question |


### 5. Advanced Application: Intelligent Document Verification
Backboard acts as a "dynamic judge" that knows *each policy's* specific rules.
*   **Concept:** Instead of hardcoding "8 Lakhs", you pass the **Policy Rules** + **User Document** to the AI.
*   **Dynamic Prompt:** 
    > "You are a verification officer for the **{policy_name}** scheme.
    > The income limit for this specific scheme is **₹{policy_income_limit}**.
    > Read the attached Income Certificate.
    > If the income is below the limit, return TRUE. If above, return FALSE."
*   **Result:** The same AI workflow handles a Student Scholarship (Limit: 2.5L) AND a Housing Scheme (Limit: 8L) correctly without code changes!

### 6. Advanced Application: Policy Recommendation Engine
Use Backboard's **Memory** feature to proactively suggest schemes.
*   **Concept:** Store user details (age, occupation, income) in Backboard's memory.
*   **Trigger:** When a **new policy** is added (e.g., "Scholarship for Students > 18"), ask Backboard: "Which of our users match these criteria?"
*   **Result:** Generate a list of users to send email/SMS notifications to!

### 7. Advanced Application: Smart Support Ticketing
For the Admin Dashboard, use Backboard to classify support tickets.
*   **Concept:** When a user submits a ticket ("My money hasn't come yet"), send it to Backboard.
*   **Action:** Backboard tags it as "Category: Payment Issue", "Urgency: High".
*   **Result:** Admins see a sorted list of urgent payment issues first!
