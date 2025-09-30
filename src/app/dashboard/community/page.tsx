"use client";

import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Send, ThumbsDown, ThumbsUp } from "lucide-react";

type Question = {
  id: number;
  author: string;
  avatar: string;
  text: string;
  timestamp: string;
};

const initialQuestions: Question[] = [
  {
    id: 1,
    author: "Ramesh Kumar",
    avatar: "RK",
    text: "What is the best time to plant wheat in Punjab? My last harvest was not good.",
    timestamp: "2 hours ago",
  },
  {
    id: 2,
    author: "Sita Devi",
    avatar: "SD",
    text: "I am seeing yellow spots on my rice plants. What could be the issue and how to solve it?",
    timestamp: "5 hours ago",
  },
  {
    id: 3,
    author: "Amit Patel",
    avatar: "AP",
    text: "Does anyone have experience with organic farming for vegetables? Looking for advice on natural pesticides.",
    timestamp: "1 day ago",
  },
];

export default function CommunityPage() {
  const [questions, setQuestions] = useState(initialQuestions);
  const [newQuestion, setNewQuestion] = useState("");

  const handlePostQuestion = () => {
    if (newQuestion.trim() === "") return;

    const question: Question = {
      id: questions.length + 1,
      author: "Demo User",
      avatar: "DU",
      text: newQuestion,
      timestamp: "Just now",
    };

    setQuestions([question, ...questions]);
    setNewQuestion("");
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold font-headline">कृषि चौपाल</h1>
        <p className="text-muted-foreground mt-2">Community Forum</p>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <h2 className="text-lg font-semibold">Ask a question</h2>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Type your question here for the community..."
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
            rows={4}
          />
        </CardContent>
        <CardFooter>
          <Button onClick={handlePostQuestion} className="ml-auto">
            <Send className="mr-2 h-4 w-4" />
            Post Question
          </Button>
        </CardFooter>
      </Card>

      <div className="space-y-6">
        {questions.map((q) => (
          <Card key={q.id}>
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <Avatar className="transition-transform transform hover:scale-110">
                  <AvatarFallback>{q.avatar}</AvatarFallback>
                </Avatar>
                <div className="w-full">
                  <div className="flex justify-between items-center">
                    <p className="font-semibold">{q.author}</p>
                    <p className="text-xs text-muted-foreground">{q.timestamp}</p>
                  </div>
                  <p className="mt-2 text-foreground/90">{q.text}</p>
                  <div className="mt-4 flex items-center gap-2">
                    <Button variant="ghost" size="sm">
                        <ThumbsUp className="h-4 w-4 mr-2"/>
                        Upvote
                    </Button>
                     <Button variant="ghost" size="sm">
                        <ThumbsDown className="h-4 w-4 mr-2"/>
                        Downvote
                    </Button>
                    <Button variant="ghost" size="sm">
                        <MessageSquare className="h-4 w-4 mr-2"/>
                        Reply
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
