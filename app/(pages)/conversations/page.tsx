"use client";
import { ReactChatbot } from "../../../chatbot/index";

export default function Page() {
  return (
    <ReactChatbot
      customerId="73873878"
      corpusIds={["5"]}
      apiKey="zwt_BGc51vuov9g_Lc7tVvHbPR6UT-Bi9PqL55XbUg"
      title="My Chatbot"
      placeholder="Chat with your AI assistant"
      inputSize="large"
      isInitiallyOpen={true}
    />
  );
}
