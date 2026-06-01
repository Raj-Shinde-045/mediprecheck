import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Loader2, CheckCircle2, Bot } from 'lucide-react';
import { generateNextQuestion } from '../../lib/triageEngine';

export function Kiosk() {
  const navigate = useNavigate();
  
  const [token, setToken] = useState('');
  const [history, setHistory] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [isThinking, setIsThinking] = useState(false);
  const [initialComplaint, setInitialComplaint] = useState('');
  const [isFinished, setIsFinished] = useState(false);
  const [questionCount, setQuestionCount] = useState(0);

  useEffect(() => {
    // Generate a random token for the patient automatically
    const newToken = `T-${Math.floor(Math.random() * 900) + 100}`;
    setToken(newToken);
  }, []);

  const startTriage = async (e) => {
    e.preventDefault();
    if (!initialComplaint.trim()) return;

    const initialHistory = [{ question: "What brings you to the clinic today?", answer: initialComplaint }];
    setHistory(initialHistory);
    askNextQuestion(initialHistory, 1);
  };

  const askNextQuestion = async (currentHistory, currentCount) => {
    setIsThinking(true);
    const nextQ = await generateNextQuestion(currentHistory, currentCount);
    setIsThinking(false);
    
    setCurrentQuestion(nextQ);
    setQuestionCount(currentCount);
  };

  const handleAnswer = (answer) => {
    if (answer === "Finish Triage") {
      setIsFinished(true);
      // Save history to local storage for the doctor's queue
      const existingQueue = JSON.parse(localStorage.getItem('doctor_queue') || '[]');
      existingQueue.push({ token, status: 'ready', timeWaiting: new Date().toLocaleTimeString() });
      localStorage.setItem('doctor_queue', JSON.stringify(existingQueue));
      localStorage.setItem(`triage_${token}`, JSON.stringify(history));
      return;
    }
    
    const newHistory = [...history, { question: currentQuestion.question, answer }];
    setHistory(newHistory);
    setCurrentQuestion(null);
    askNextQuestion(newHistory, questionCount + 1);
  };

  if (isFinished) {
    return (
      <div className="flex h-[80vh] items-center justify-center animate-in zoom-in duration-500">
        <Card glass className="max-w-md text-center p-10">
          <CheckCircle2 className="w-24 h-24 text-green-500 mx-auto mb-6" />
          <h2 className="text-4xl font-bold mb-4">You're All Set!</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Your Token Number is: <span className="font-bold text-primary">{token}</span>
          </p>
          <p className="text-muted-foreground mb-8">
            Your doctor has received your symptoms and is reviewing them. Please take a seat in the waiting area.
          </p>
          <Button onClick={() => window.location.reload()} className="w-full h-12 text-lg">
            Start New Patient
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto mt-8 animate-in slide-in-from-bottom-8 duration-500">
      <div className="flex items-center gap-4 mb-8">
        <div className="bg-primary/20 p-4 rounded-full">
          <Bot className="w-10 h-10 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Patient Kiosk</h1>
          <p className="text-muted-foreground text-lg">Let's quickly figure out what's wrong.</p>
        </div>
      </div>

      <Card glass className="overflow-hidden shadow-2xl border-primary/20">
        <CardContent className="p-0 flex flex-col h-[60vh]">
          <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-gradient-to-b from-transparent to-background/50">
            {history.map((item, i) => (
              <div key={i} className="space-y-4">
                <div className="flex justify-start animate-in fade-in slide-in-from-left-4">
                  <div className="bg-muted px-6 py-4 rounded-2xl rounded-tl-none max-w-[85%] text-lg shadow-sm">
                    {item.question}
                  </div>
                </div>
                {item.answer && (
                  <div className="flex justify-end animate-in fade-in slide-in-from-right-4">
                    <div className="bg-primary text-primary-foreground px-6 py-4 rounded-2xl rounded-tr-none max-w-[85%] text-lg shadow-sm">
                      {item.answer}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {currentQuestion && !isThinking && (
              <div className="flex justify-start animate-in fade-in slide-in-from-bottom-4">
                <div className="bg-muted px-6 py-4 rounded-2xl rounded-tl-none max-w-[85%] text-lg shadow-sm border border-primary/20">
                  {currentQuestion.question}
                </div>
              </div>
            )}

            {isThinking && (
              <div className="flex justify-start animate-in fade-in">
                <div className="bg-muted px-6 py-4 rounded-2xl rounded-tl-none flex items-center space-x-3 shadow-sm">
                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                  <span className="text-muted-foreground italic">Analyzing your symptoms...</span>
                </div>
              </div>
            )}
          </div>

          <div className="p-6 border-t bg-background/80 backdrop-blur-md">
            {history.length === 0 ? (
              <form onSubmit={startTriage} className="flex gap-4">
                <Input 
                  placeholder="E.g., I have a severe headache and nausea..." 
                  value={initialComplaint}
                  onChange={(e) => setInitialComplaint(e.target.value)}
                  className="flex-1 h-14 text-lg px-6 rounded-full"
                  autoFocus
                />
                <Button type="submit" disabled={!initialComplaint.trim()} className="h-14 px-8 rounded-full text-lg shadow-lg shadow-primary/25 hover:-translate-y-1 transition-transform">
                  Start
                </Button>
              </form>
            ) : currentQuestion && !isThinking ? (
              <div className="grid grid-cols-3 gap-4 animate-in slide-in-from-bottom-4">
                {currentQuestion.options.map(opt => (
                  <Button 
                    key={opt} 
                    variant={opt === 'Yes' ? 'primary' : opt === 'No' ? 'destructive' : 'secondary'}
                    className="h-16 text-xl rounded-2xl shadow-md hover:shadow-lg transition-all hover:-translate-y-1"
                    onClick={() => handleAnswer(opt)}
                  >
                    {opt}
                  </Button>
                ))}
              </div>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
