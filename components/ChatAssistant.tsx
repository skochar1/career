"use client";

import { useRef, useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "./ui/sheet";
import {
  MessageCircle,
  Send,
  User,
  Sparkles,
  Bot,
} from "lucide-react";

interface Message {
  id: string;
  type: "user" | "assistant";
  content: string;
  timestamp: Date;
  suggestions?: string[];
}

export function ChatAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      type: "assistant",
      content:
        "Hi! I'm your AI Career Assistant. Ask me about resume tips, job searching, or career advice.",
      timestamp: new Date(),
      suggestions: [
        "Review my resume for improvements",
        "What careers match my background?",
        "How do I transition to tech?",
      ],
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || isTyping) return;
    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setMessage("");
    setIsTyping(true);

    try {
      const apiResponse = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(({ type, content }) => ({
            type,
            content,
          })),
        }),
      });
      
      if (!apiResponse.ok) {
        throw new Error(`HTTP error! status: ${apiResponse.status}`);
      }
      
      const contentType = apiResponse.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Response is not JSON');
      }
      
      const data = await apiResponse.json();
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: data.response,
        timestamp: new Date(),
        suggestions: data.suggestions,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          type: "assistant",
          content: "Sorry, something went wrong. Please try again.",
          timestamp: new Date(),
        },
      ]);
    }
    setIsTyping(false);
  };

  const handleSuggestionClick = (suggestion: string) => {
    if (!isTyping) handleSendMessage(suggestion);
  };

  // Improved styling for user and assistant bubbles
  const bubbleBase =
    "max-w-[85%] px-4 py-2 rounded-2xl text-sm leading-relaxed shadow-sm whitespace-pre-line";
  const userBubble =
    "ml-auto bg-blue-600 text-white rounded-br-sm";
  const assistantBubble =
    "mr-auto bg-gray-100 text-gray-900 rounded-bl-sm border border-gray-200";

  return (
    <>
      {/* Floating Chat Button */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-shadow z-50 bg-blue-600 hover:bg-blue-700 text-white"
            aria-label="Open career chat assistant"
            disabled={isTyping}
          >
            <MessageCircle className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent className="w-full sm:max-w-md flex flex-col h-full bg-white rounded-3xl shadow-2xl border border-gray-100">
          <SheetHeader className="p-4 pb-2 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div>
                <SheetTitle className="text-lg font-bold">
                  AI Career Assistant
                </SheetTitle>
                <SheetDescription className="text-xs text-gray-400">
                  Your AI-powered career guidance
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-6 space-y-3 bg-gray-50">
            {messages.map((msg, idx) => (
              <div
                key={msg.id}
                className={`flex gap-2 items-end ${msg.type === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.type === "assistant" && (
                  <div className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-100">
                    <Bot className="h-5 w-5 text-blue-500" />
                  </div>
                )}
                <div
                  className={`${bubbleBase} ${
                    msg.type === "user" ? userBubble : assistantBubble
                  }`}
                >
                  {msg.content}
                  {/* Show suggestions only for last assistant msg */}
                  {msg.type === "assistant" &&
                    msg.suggestions &&
                    msg.suggestions.length > 0 &&
                    idx === messages.length - 1 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {msg.suggestions.map((suggestion, i) => (
                          <button
                            key={i}
                            className="bg-white border border-gray-300 text-gray-700 px-3 py-1 rounded-full text-xs hover:bg-blue-50 hover:border-blue-300 transition"
                            onClick={() => handleSuggestionClick(suggestion)}
                            disabled={isTyping}
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    )}
                </div>
                {msg.type === "user" && (
                  <div className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200">
                    <User className="h-5 w-5 text-gray-500" />
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
            {isTyping && (
              <div className="flex gap-2 items-end">
                <div className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-100">
                  <Bot className="h-5 w-5 text-blue-500" />
                </div>
                <div
                  className={`${bubbleBase} ${assistantBubble} flex items-center gap-2`}
                >
                  <span className="block w-2 h-2 rounded-full bg-gray-400 animate-bounce" />
                  <span
                    className="block w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  />
                  <span
                    className="block w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  />
                </div>
              </div>
            )}
          </div>
          {/* Input */}
          <form
            className="flex gap-2 border-t border-gray-100 p-4 bg-white"
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(message);
            }}
          >
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask me anything about your career..."
              className="flex-1 text-base px-4 py-2 bg-gray-50 rounded-full border border-gray-200"
              disabled={isTyping}
              aria-label="Type your career question"
              autoComplete="off"
            />
            <Button
              type="submit"
              size="icon"
              disabled={!message.trim() || isTyping}
              className="h-10 w-10 rounded-full bg-blue-600 hover:bg-blue-700 text-white"
              aria-label="Send message"
            >
              <Send className="h-5 w-5" />
            </Button>
          </form>
        </SheetContent>
      </Sheet>
    </>
  );
}
