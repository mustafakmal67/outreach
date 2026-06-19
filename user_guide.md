# Step-by-Step Guide: Automating Dental Leads Analysis in Chat

This guide outlines how to use the system prompt blueprint to process your dental clinic lead CSV data directly in any chat interface, ensuring 100% adherence to formatting and zero hallucination.

---

## Step 1: Initialize the Agent
1. Open a new chat session in the target Antigravity agent or LLM chat interface.
2. Copy the entire system prompt box from [operational_blueprint.md](file:///D:/oakstone%20media/Agency/instagram/dental-outreach-engine/operational_blueprint.md).
3. Paste it as your first message (or configure it in the agent's System Prompt / Custom Instructions field if the application has one).
4. Send the message. The agent should acknowledge that it is ready to process your CSV leads and will wait for input.

---

## Step 2: Format & Prepare Your Leads
The prompt is configured to take standard comma-separated values (CSV) lines. 
If your lead spreadsheet has columns: `clinic_name, instagram, city, notes`, prepare them in raw text format.

### Example Paste Layout:
```csv
clinic_name, instagram, city, notes
Smile Care Dental,@smilecarekarachi,Karachi,"small clinic"
Bright Dental,,Islamabad,"new clinic"
Khyber Orthodontics,https://instagram.com/khyber_ortho,Peshawar,"aesthetic clinic focusing on braces"
```

> [!TIP]
> **Batch Processing Recommendation:**
> For the best results and response-length safety, paste leads in batches of **5 to 10 rows** at a time. This prevents the model from getting truncated and ensures it maintains focus on the formatting constraints.

---

## Step 3: Paste and Process
1. Paste your formatted rows directly into the chat box.
2. Hit send.
3. The agent will process each lead row sequentially and output the exact structure for each, stopping at the boundary markers.

---

## Step 4: Extract and Copy Outreach Messages
1. Locate the **Section 5: PERSONALIZED OUTREACH MESSAGE** for the desired clinic in the chat output.
2. Select and copy the 5 lines.
3. The message is fully safe to send via WhatsApp or Instagram DM directly to the clinic since it utilizes only verified data and contains no emojis or fabricated facts.

---

## Step 5: Verification & Self-Check Checklist
Before pasting a generated outreach message to a client, double check:
1. **No Emojis:** Did the agent accidentally include emojis? (If yes, delete them).
2. **Under 8 Lines:** Ensure the message does not exceed 8 lines.
3. **No Placeholders:** Ensure the city name and clinic name are spelled exactly as they are in your CSV.
