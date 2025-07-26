"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent } from "./ui/card";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import {
  MessageCircle,
  Send,
  User,
  Sparkles,
  FileText,
  TrendingUp,
  Search,
  Lightbulb,
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
        "Hi! I'm your AI Career Assistant. I can help you improve your resume, explore career transitions, find relevant job opportunities, and provide personalized career guidance. What would you like to know?",
      timestamp: new Date(),
      suggestions: [
        "Review my resume for improvements",
        "What careers match my background?",
        "How do I transition to tech?",
        "Find jobs similar to my experience",
      ],
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const suggestedPrompts = [
    {
      icon: <FileText className="h-5 w-5" />,
      text: "Review my resume for improvements",
      category: "Resume Help",
    },
    {
      icon: <TrendingUp className="h-5 w-5" />,
      text: "What careers match my background?",
      category: "Career Guidance",
    },
    {
      icon: <Search className="h-5 w-5" />,
      text: "Find jobs similar to my experience",
      category: "Job Search",
    },
    {
      icon: <Lightbulb className="h-5 w-5" />,
      text: "How do I transition to tech?",
      category: "Career Change",
    },
  ];

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setMessage("");
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const response = generateMockResponse(content);
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: response.content,
        timestamp: new Date(),
        suggestions: response.suggestions,
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const generateMockResponse = (
    userInput: string
  ): { content: string; suggestions?: string[] } => {
    const input = userInput.toLowerCase();

    if (input.includes("resume") && input.includes("review")) {
      return {
        content:
          "I'd be happy to help review your resume! To provide the most relevant feedback, I'll need to see your current resume. You can upload it using the resume upload feature in the main search area. Once uploaded, I can help you with:\n\n• Optimizing keywords for ATS systems\n• Improving formatting and structure\n• Highlighting your key achievements\n• Tailoring content for specific roles\n• Identifying gaps or areas for improvement\n\nWould you like me to guide you through uploading your resume first?",
        suggestions: [
          "How do I upload my resume?",
          "What makes a resume ATS-friendly?",
          "Show me resume examples",
          "Help me write better bullet points",
        ],
      };
    }

    if (
      input.includes("career") &&
      (input.includes("match") || input.includes("transition"))
    ) {
      return {
        content:
          "Great question! Career transitions can be exciting opportunities for growth. Based on common career paths, here are some approaches I can help you with:\n\n• **Skills Assessment**: Identify transferable skills from your current role\n• **Industry Research**: Explore growing fields that match your interests\n• **Gap Analysis**: Determine what additional skills or experience you might need\n• **Networking Strategy**: Connect with professionals in your target field\n• **Resume Repositioning**: Highlight relevant experience for new industries\n\nWhat's your current field, and what type of career are you considering transitioning to?",
        suggestions: [
          "I'm in marketing, want to try UX design",
          "Moving from finance to tech",
          "Transitioning from teaching to corporate",
          "I want to start my own business",
        ],
      };
    }

    if (input.includes("job") && input.includes("similar")) {
      return {
        content:
          "I can help you find jobs that match your experience! To provide the most relevant recommendations, I'll analyze your background and suggest:\n\n• **Role Matches**: Positions that align with your skills and experience\n• **Industry Opportunities**: Jobs in sectors you might not have considered\n• **Growth Paths**: Senior or lateral positions based on your career level\n• **Remote Options**: Flexible work arrangements in your field\n• **Salary Insights**: Compensation ranges for similar roles\n\nTo get started, could you tell me about your current role and the type of work environment you're looking for?",
        suggestions: [
          "I'm a software engineer looking for remote work",
          "Marketing manager seeking growth opportunities",
          "Looking for part-time consulting roles",
          "Want to explore startup opportunities",
        ],
      };
    }

    if (input.includes("tech") && input.includes("transition")) {
      return {
        content:
          "Transitioning to tech is a popular and achievable goal! Here's a roadmap I can help you with:\n\n• **Choose Your Path**: Development, design, product management, data science, etc.\n• **Skill Development**: Coding bootcamps, online courses, certifications\n• **Portfolio Building**: Create projects that demonstrate your abilities\n• **Network Building**: Join tech communities and attend events\n• **Resume Optimization**: Highlight transferable skills and tech projects\n• **Interview Prep**: Technical and behavioral interview preparation\n\nWhat area of tech interests you most? Are you drawn to coding, design, data, or something else?",
        suggestions: [
          "I want to learn web development",
          "Interested in data science",
          "UX/UI design appeals to me",
          "Product management seems interesting",
        ],
      };
    }

    // Default response
    return {
      content:
        "I understand you're looking for career guidance. I'm here to help with resume reviews, career transitions, job search strategies, and professional development advice. Could you tell me more specifically what you'd like assistance with?",
      suggestions: [
        "Help me improve my resume",
        "I want to change careers",
        "Find better job opportunities",
        "Develop my skills",
      ],
    };
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleSendMessage(suggestion);
  };

  return (
    <>
      {/* Floating Chat Button */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-shadow z-50 bg-blue-600 hover:bg-blue-700 text-white"
            aria-label="Open career chat assistant"
          >
            <MessageCircle className="h-6 w-6" />
          </Button>
        </SheetTrigger>

        <SheetContent className="w-full sm:max-w-md p-0 flex flex-col h-full bg-white shadow-2xl border border-border rounded-2xl">
          <SheetHeader className="p-6 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#191C23] rounded-full flex items-center justify-center">
                <Sparkles className="h-7 w-7 text-white" />
              </div>
              <div>
                <SheetTitle className="text-left text-lg font-semibold">
                  Career Assistant
                </SheetTitle>
                <SheetDescription className="text-left text-gray-500">
                  Your AI-powered career guidance
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-end gap-4 ${
                  msg.type === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {msg.type === "assistant" && (
                  <div className="w-12 h-12 bg-[#191C23] rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="h-7 w-7 text-white" />
                  </div>
                )}

                <div className={`max-w-[80%] ${msg.type === "user" ? "order-1" : ""}`}>
                  <Card
                    className={
                      msg.type === "user"
                        ? "bg-blue-600 text-white rounded-2xl"
                        : "bg-gray-100 text-gray-900 rounded-2xl"
                    }
                  >
                    <CardContent className="p-4 text-base">
                      <div className="whitespace-pre-line">{msg.content}</div>
                    </CardContent>
                  </Card>

                  {msg.suggestions && (
                    <div className="mt-3 space-y-2">
                      {msg.suggestions.map((suggestion, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="lg"
                          className="w-full justify-start rounded-lg border border-gray-300 text-base text-left"
                          onClick={() => handleSuggestionClick(suggestion)}
                        >
                          {suggestion}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>

                {msg.type === "user" && (
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="h-7 w-7 text-gray-600" />
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex items-end gap-4">
                <div className="w-12 h-12 bg-[#191C23] rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="h-7 w-7 text-white" />
                </div>
                <Card className="bg-gray-100 rounded-2xl">
                  <CardContent className="p-4">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          {/* Quick Suggestions */}
          {messages.length === 1 && (
            <div className="p-6 border-t border-border">
              <p className="text-base text-gray-500 mb-4">
                Try asking about:
              </p>
              <div className="grid grid-cols-1 gap-3">
                {suggestedPrompts.map((prompt, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="lg"
                    className="justify-start w-full rounded-lg border border-gray-300 px-4 py-3 text-base text-left"
                    onClick={() => handleSendMessage(prompt.text)}
                  >
                    <div className="flex items-center gap-3">
                      {prompt.icon}
                      <div className="text-left">
                        <div className="text-base">{prompt.text}</div>
                        <div className="text-xs text-gray-400">{prompt.category}</div>
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Message Input */}
          <div className="p-6 border-t border-border">
            <div className="flex gap-3">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ask me anything about your career..."
                className="flex-1 text-base py-3"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(message);
                  }
                }}
                disabled={isTyping}
                aria-label="Type your career question"
              />
              <Button
                onClick={() => handleSendMessage(message)}
                disabled={!message.trim() || isTyping}
                size="icon"
                aria-label="Send message"
                className="h-12 w-12 rounded-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
