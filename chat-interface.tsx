import React, { useState, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Mic, Send, VolumeX, Volume2 } from 'lucide-react';

const ChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef(null);
  const scrollAreaRef = useRef(null);

  // Simulating the API calls since we can't make actual calls in this environment
  const simulateCharacterAIResponse = async (message) => {
    // In reality, you would call your character.ai API here
    return {
      name: "Character",
      text: `This is a simulated response to: "${message}"`
    };
  };

  const simulateTextToSpeech = async (text) => {
    // In reality, you would call your text-to-speech API here
    // and return an audio URL
    return "/api/placeholder/audio";
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    setIsLoading(true);
    const newUserMessage = {
      id: Date.now(),
      sender: 'user',
      text: inputMessage,
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, newUserMessage]);
    setInputMessage('');

    try {
      // Get AI response
      const aiResponse = await simulateCharacterAIResponse(inputMessage);
      const audioUrl = await simulateTextToSpeech(aiResponse.text);

      const newAIMessage = {
        id: Date.now() + 1,
        sender: 'ai',
        text: aiResponse.text,
        audioUrl,
        timestamp: new Date().toLocaleTimeString()
      };

      setMessages(prev => [...prev, newAIMessage]);

      if (!isMuted && audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.play();
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto h-[600px] flex flex-col">
      <CardHeader className="border-b">
        <CardTitle className="flex justify-between items-center">
          <span>Character AI Chat</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMuted(!isMuted)}
          >
            {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
          </Button>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 p-4 flex flex-col">
        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-4" ref={scrollAreaRef}>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.sender === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100'
                  }`}
                >
                  <p>{message.text}</p>
                  <span className="text-xs opacity-70">{message.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="mt-4 flex gap-2">
          <Input
            placeholder="Type your message..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            onClick={handleSendMessage}
            disabled={isLoading}
            className="w-12"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </CardContent>

      <audio ref={audioRef} className="hidden" />
    </Card>
  );
};

export default ChatInterface;
