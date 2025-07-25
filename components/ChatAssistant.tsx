"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "./ui/sheet";
import { MessageCircle, Send, X, User, Bot, Sparkles, FileText, TrendingUp, Search, Lightbulb } from "lucide-react";

interface Message {
  id: string;
  type: 'user' | 'assistant';
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
      content: "Hi! I'm your AI Career Assistant. I can help you improve your resume, explore career transitions, find relevant job opportunities, and provide personalized career guidance. What would you like to know?",
      timestamp: new Date(),
      suggestions: [
        "Review my resume for improvements",
        "What careers match my background?",
        "How do I transition to tech?",
        "Find jobs similar to my experience"
      ]
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const suggestedPrompts = [
    {
      icon: <FileText className="h-4 w-4" />,
      text: "Review my resume for improvements",
      category: "Resume Help"
    },
    {
      icon: <TrendingUp className="h-4 w-4" />,
      text: "What careers match my background?",
      category: "Career Guidance"
    },
    {
      icon: <Search className="h-4 w-4" />,
      text: "Find jobs similar to my experience",
      category: "Job Search"
    },
    {
      icon: <Lightbulb className="h-4 w-4" />,
      text: "How do I transition to tech?",
      category: "Career Change"
    }
  ];

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setMessage("");
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const response = generateMockResponse(content);
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: response.content,
        timestamp: new Date(),
        suggestions: response.suggestions
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const generateMockResponse = (userInput: string): { content: string; suggestions?: string[] } => {
    const input = userInput.toLowerCase();
    
    if (input.includes('resume') && input.includes('review')) {
      return {
        content: "I'd be happy to help review your resume! To provide the most relevant feedback, I'll need to see your current resume. You can upload it using the resume upload feature in the main search area. Once uploaded, I can help you with:\n\n• Optimizing keywords for ATS systems\n• Improving formatting and structure\n• Highlighting your key achievements\n• Tailoring content for specific roles\n• Identifying gaps or areas for improvement\n\nWould you like me to guide you through uploading your resume first?",
        suggestions: ["How do I upload my resume?", "What makes a resume ATS-friendly?", "Show me resume examples", "Help me write better bullet points"]
      };
    }
    
    if (input.includes('career') && (input.includes('match') || input.includes('transition'))) {
      return {
        content: "Great question! Career transitions can be exciting opportunities for growth. Based on common career paths, here are some approaches I can help you with:\n\n• **Skills Assessment**: Identify transferable skills from your current role\n• **Industry Research**: Explore growing fields that match your interests\n• **Gap Analysis**: Determine what additional skills or experience you might need\n• **Networking Strategy**: Connect with professionals in your target field\n• **Resume Repositioning**: Highlight relevant experience for new industries\n\nWhat's your current field, and what type of career are you considering transitioning to?",
        suggestions: ["I'm in marketing, want to try UX design", "Moving from finance to tech", "Transitioning from teaching to corporate", "I want to start my own business"]
      };
    }
    
    if (input.includes('job') && input.includes('similar')) {
      return {
        content: "I can help you find jobs that match your experience! To provide the most relevant recommendations, I'll analyze your background and suggest:\n\n• **Role Matches**: Positions that align with your skills and experience\n• **Industry Opportunities**: Jobs in sectors you might not have considered\n• **Growth Paths**: Senior or lateral positions based on your career level\n• **Remote Options**: Flexible work arrangements in your field\n• **Salary Insights**: Compensation ranges for similar roles\n\nTo get started, could you tell me about your current role and the type of work environment you're looking for?",
        suggestions: ["I'm a software engineer looking for remote work", "Marketing manager seeking growth opportunities", "Looking for part-time consulting roles", "Want to explore startup opportunities"]
      };
    }
    
    if (input.includes('tech') && input.includes('transition')) {
      return {
        content: "Transitioning to tech is a popular and achievable goal! Here's a roadmap I can help you with:\n\n• **Choose Your Path**: Development, design, product management, data science, etc.\n• **Skill Development**: Coding bootcamps, online courses, certifications\n• **Portfolio Building**: Create projects that demonstrate your abilities\n• **Network Building**: Join tech communities and attend events\n• **Resume Optimization**: Highlight transferable skills and tech projects\n• **Interview Prep**: Technical and behavioral interview preparation\n\nWhat area of tech interests you most? Are you drawn to coding, design, data, or something else?",
        suggestions: ["I want to learn web development", "Interested in data science", "UX/UI design appeals to me", "Product management seems interesting"]
      };
    }

    // Default response
    return {
      content: "I understand you're looking for career guidance. I'm here to help with resume reviews, career transitions, job search strategies, and professional development advice. Could you tell me more specifically what you'd like assistance with?",
      suggestions: ["Help me improve my resume", "I want to change careers", "Find better job opportunities", "Develop my skills"]
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
            className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-shadow z-50"
            aria-label="Open career chat assistant"
          >
            <MessageCircle className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        
        <SheetContent className="w-full sm:max-w-md p-0 flex flex-col h-full">
          <SheetHeader className="p-4 border-b border-border">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-primary-foreground" />
              </div>
              <div>
                <SheetTitle className="text-left">Career Assistant</SheetTitle>
                <SheetDescription className="text-left">
                  Your AI-powered career guidance
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.type === 'assistant' && (
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="h-4 w-4 text-primary-foreground" />
                  </div>
                )}
                
                <div className={`max-w-[80%] ${msg.type === 'user' ? 'order-1' : ''}`}>
                  <Card className={`${msg.type === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                    <CardContent className="p-3 text-sm">
                      <div className="whitespace-pre-line">{msg.content}</div>
                    </CardContent>
                  </Card>
                  
                  {msg.suggestions && (
                    <div className="mt-2 space-y-1">
                      {msg.suggestions.map((suggestion, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          className="mr-2 mb-1 text-xs h-7"
                          onClick={() => handleSuggestionClick(suggestion)}
                        >
                          {suggestion}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
                
                {msg.type === 'user' && (
                  <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="h-4 w-4 text-secondary-foreground" />
                  </div>
                )}
              </div>
            ))}
            
            {isTyping && (
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="h-4 w-4 text-primary-foreground" />
                </div>
                <Card className="bg-muted">
                  <CardContent className="p-3">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          {/* Quick Suggestions */}
          {messages.length === 1 && (
            <div className="p-4 border-t border-border">
              <p className="text-sm text-muted-foreground mb-3">Try asking about:</p>
              <div className="grid grid-cols-1 gap-2">
                {suggestedPrompts.map((prompt, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="justify-start h-auto p-3"
                    onClick={() => handleSendMessage(prompt.text)}
                  >
                    <div className="flex items-center gap-2">
                      {prompt.icon}
                      <div className="text-left">
                        <div className="text-sm">{prompt.text}</div>
                        <div className="text-xs text-muted-foreground">{prompt.category}</div>
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Message Input */}
          <div className="p-4 border-t border-border">
            <div className="flex gap-2">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ask me anything about your career..."
                className="flex-1"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
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
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}