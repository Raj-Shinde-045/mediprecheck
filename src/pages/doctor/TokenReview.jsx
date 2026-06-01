import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ArrowLeft, Stethoscope, FileText, CheckCircle2 } from 'lucide-react';
import { generateSummary } from '../../lib/gemini';

export function TokenReview() {
  const navigate = useNavigate();
  const { token } = useParams();
  const [history, setHistory] = useState([]);
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      // In a real app, fetch from Firestore
      const savedHistory = localStorage.getItem(`triage_${token}`);
      if (savedHistory) {
        const parsed = JSON.parse(savedHistory);
        setHistory(parsed);
      } else {
        // Fallback mock
        const mockHistory = [
          { question: "What brings you to the clinic today?", answer: "My stomach hurts really bad." },
          { question: "Is the pain sharp or dull?", answer: "Sharp" },
          { question: "Do you have a fever?", answer: "Yes" }
        ];
        setHistory(mockHistory);
      }
      setIsLoading(false);
    };
    loadData();
  }, [token]);

  const handleGenerateSummary = async () => {
    setIsLoading(true);
    const aiSummary = await generateSummary(history);
    setSummary(aiSummary);
    setIsLoading(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-4xl mx-auto mt-8">
      <Button variant="ghost" onClick={() => navigate('/doctor')} className="-ml-4 mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Queue
      </Button>

      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-4xl font-bold tracking-wider">{token}</h1>
          <p className="text-muted-foreground mt-1 text-lg">Patient Triage Review</p>
        </div>
        <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => navigate('/doctor')}>
          <CheckCircle2 className="w-5 h-5 mr-2" /> Mark as Consulted
        </Button>
      </div>

      {isLoading ? (
        <div className="h-64 flex items-center justify-center">
          <p className="text-muted-foreground animate-pulse">AI is generating summary...</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          <Card glass className="md:col-span-3 border-primary/20">
            <CardHeader className="bg-primary/5 border-b flex flex-row items-center justify-between">
              <CardTitle className="flex items-center text-xl text-primary">
                <Stethoscope className="w-6 h-6 mr-3" />
                AI Triage Summary
              </CardTitle>
              {!summary && (
                <Button onClick={handleGenerateSummary} variant="outline" size="sm">
                  Generate AI Summary
                </Button>
              )}
            </CardHeader>
            <CardContent className="p-6">
              {summary ? (
                <p className="text-lg leading-relaxed whitespace-pre-wrap">{summary}</p>
              ) : (
                <p className="text-muted-foreground italic">No summary generated yet. Click the button above to analyze the transcript.</p>
              )}
            </CardContent>
          </Card>

          <Card glass className="md:col-span-3">
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <FileText className="w-5 h-5 mr-2 text-muted-foreground" />
                Raw Q&A Transcript
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4 bg-muted/20">
              {history.map((item, i) => (
                <div key={i} className="flex flex-col gap-3 p-5 rounded-2xl bg-background/80 border border-primary/10 shadow-sm transition-all hover:shadow-md hover:border-primary/30">
                  <div className="flex items-start gap-4">
                    <div className="bg-muted text-muted-foreground font-bold text-xs px-2.5 py-1 rounded-md mt-0.5">Q</div>
                    <span className="font-medium text-foreground text-lg leading-tight">{item.question}</span>
                  </div>
                  <div className="flex items-start gap-4 ml-6 pl-4 border-l-2 border-primary/20">
                    <div className="bg-primary text-primary-foreground font-bold text-xs px-2.5 py-1 rounded-md mt-0.5 shadow-sm shadow-primary/20">A</div>
                    <span className="text-foreground font-bold text-lg leading-tight">
                      {item.answer || <span className="italic text-muted-foreground font-normal">No answer</span>}
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
