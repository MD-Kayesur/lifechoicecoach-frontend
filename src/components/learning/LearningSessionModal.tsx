import React, { useState } from 'react';
import { X, Loader2, PlayCircle, ShieldCheck, Zap } from 'lucide-react';
import { useInteractAiSessionMutation } from '@/redux/features/learning/aiLearningApi';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { toast } from 'sonner';
import { Send, User, Bot, Sparkles, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStartSessionMutation } from '@/redux/features/learning/LearningSessionApi';

interface LearningSessionModalProps {
    isOpen: boolean;
    onClose: () => void;
    competency: {
        id: number;
        title: string;
        description: string;
        code?: string | number;
    } | null;
    microCredentialId: number;
    domainId: number;
    status?: string;
}

export const LearningSessionModal = ({ isOpen, onClose, competency, microCredentialId, domainId, status }: LearningSessionModalProps) => {
    const [startSession, { isLoading: isStarting }] = useStartSessionMutation();
    const [interactSession, { isLoading: isInteracting }] = useInteractAiSessionMutation();
    const [hasStarted, setHasStarted] = useState(false);
    const [sessionId, setSessionId] = useState<string | number | null>(null);
    const [messages, setMessages] = useState<{ role: 'user' | 'ai'; content: string }[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isPassed, setIsPassed] = useState(false);
    const scrollRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    if (!isOpen || !competency) return null;

    const handleStartSession = async () => {
        try {
            const result = await startSession({
                competency_id: competency.id,
                mc_access_id: microCredentialId,
            }).unwrap() as any;
 
            const sessionData = result.learning_session?.session || result.session;
            const sid = sessionData?.id || result.session_id || result.id || result.data?.session_id;

            if (sid) {
                setSessionId(sid);

                // Load existing interactions if any
                const existingInteractions = sessionData?.interactions || [];
                
                if (existingInteractions.length > 0) {
                    const formattedMessages = existingInteractions.flatMap((int: any) => {
                        const msgs = [];
                        if (int.learner_input) {
                            msgs.push({ role: 'user' as const, content: int.learner_input });
                        }
                        if (int.ai_response) {
                            msgs.push({ role: 'ai' as const, content: int.ai_response });
                        }
                        return msgs;
                    });
                    setMessages(formattedMessages);
                    setHasStarted(true);
                    toast.success("Learning session resumed!");
                } else {
                    // First hit with only token (empty message) to get the latest state/prompt
                    try {
                        const firstInteract = await interactSession({ sessionId: sid }).unwrap() as any;
                     console.log("First Interact Result:", firstInteract);
                        // Open chat on any successful response
                        setHasStarted(true);
                        toast.success("Learning session started!");
                        
                        if (firstInteract.history && Array.isArray(firstInteract.history) && firstInteract.history.length > 0) {
                            const historyMessages = firstInteract.history.map((msg: any) => ({
                                role: msg.role === 'assistant' ? 'ai' : 'user',
                                content: msg.content
                            }));
                            setMessages(historyMessages);
                        } else {
                            const aiContent = firstInteract.ai_response || 
                                             firstInteract.message || 
                                             firstInteract.response || 
                                             firstInteract.text ||
                                             firstInteract.interaction?.ai_response ||
                                             firstInteract.data?.ai_response;

                            if (aiContent) {
                                setMessages([{ 
                                    role: 'ai', 
                                    content: aiContent
                                }]);
                            }
                        }

                        if (firstInteract.remote_assessment_passed) {
                            setIsPassed(true);
                        }
                    } catch (err) {
                        console.error("Initial interaction error:", err);
                        toast.error("Failed to connect with AI coach");
                    }
                }
            } else {
                toast.error(result.message || "Failed to start learning session");
            }
        } catch (error: any) {
            console.error("Session start error:", error);
            toast.error(error?.data?.message || "An error occurred while starting the session");
        }
    };

    const handleSendMessage = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!inputValue.trim() || isInteracting || !sessionId) return;

        const userMsg = inputValue.trim();
        setInputValue('');
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);

        try {
            const result = await interactSession({
                sessionId,
                message: userMsg
            }).unwrap() as any;
           
            const aiContent = result.ai_response || 
                             result.message || 
                             result.response || 
                             result.text ||
                             result.interaction?.ai_response ||
                             result.data?.ai_response;

            if (aiContent) {
                setMessages(prev => [...prev, { 
                    role: 'ai', 
                    content: aiContent 
                }]);
            }

            if (result.remote_assessment_passed) {
                setIsPassed(true);
            }

             console.log("Interact Result:", result);
        } catch (error: any) {
            toast.error("Failed to get AI response");
            console.error("Interaction error:", error);
        }
    };

    return (
        <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4">
            <div 
                className="absolute inset-0 bg-[#040812]/90 backdrop-blur-md animate-in fade-in duration-300"
                onClick={onClose}
            ></div>
            <div className={cn(
                "relative w-full bg-[#0a111e] border border-gold/30 rounded-[24px] shadow-[0_0_100px_rgba(196,136,14,0.15)] overflow-hidden animate-in zoom-in-95 fade-in duration-300 flex flex-col transition-all",
                hasStarted ? "max-w-[700px] h-[80vh]" : "max-w-[480px]"
            )}>
                {/* Header Decoration */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gold/50 to-transparent z-50"></div>
                
                {hasStarted ? (
                    // CHAT INTERFACE
                    <div className="flex flex-col h-full">
                        {/* Chat Header */}
                        <div className="p-4 sm:p-6 border-b border-white/10 bg-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <button 
                                    onClick={() => setHasStarted(false)}
                                    className="p-2 hover:bg-white/5 rounded-full text-white/40 hover:text-white transition-all"
                                >
                                    <ChevronLeft size={20} />
                                </button>
                                <div>
                                    <h3 className="text-white font-serif font-bold text-lg leading-tight truncate max-w-[200px] sm:max-w-md">
                                        {competency.title}
                                    </h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                                        <span className="text-[10px] text-white/40 uppercase font-mono tracking-widest">AI Learning Assistant</span>
                                    </div>
                                </div>
                            </div>
                            <button 
                                onClick={onClose}
                                className="text-white/30 hover:text-white transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Messages Area */}
                        <div 
                            ref={scrollRef}
                            className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 custom-scrollbar"
                        >
                            {messages.map((msg, i) => (
                                <div 
                                    key={i} 
                                    className={cn(
                                        "flex gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300",
                                        msg.role === 'user' ? "flex-row-reverse" : "flex-row"
                                    )}
                                >
                                    <div className={cn(
                                        "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                                        msg.role === 'user' ? "bg-gold/20 text-gold" : "bg-white/5 text-primary"
                                    )}>
                                        {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                                    </div>
                                    <div className={cn(
                                        "max-w-[85%] p-4 rounded-2xl text-[14px] leading-relaxed",
                                        msg.role === 'user' 
                                            ? "bg-gold text-white rounded-tr-none" 
                                            : "bg-white/5 text-white/80 border border-white/10 rounded-tl-none"
                                    )}>
                                        {msg.role === 'ai' ? (
                                            <ReactMarkdown 
                                                remarkPlugins={[remarkGfm]}
                                                components={{
                                                    h1: ({...props}) => <h1 className="text-4xl font-extrabold mb-6 text-white tracking-tight" {...props} />,
                                                    h2: ({...props}) => <h2 className="text-2xl font-extrabold mb-5 mt-8 text-white tracking-tight" {...props} />,
                                                    h3: ({...props}) => <h3 className="text-2xl font-extrabold mb-4 mt-7 text-white tracking-tight" {...props} />,
                                                    p: ({...props}) => <p className="mb-4 last:mb-0" {...props} />,
                                                    ul: ({...props}) => <ul className="list-disc ml-4 mb-4" {...props} />,
                                                    ol: ({...props}) => <ol className="list-decimal ml-4 mb-4" {...props} />,
                                                    li: ({...props}) => <li className="mb-1" {...props} />,
                                                    table: ({...props}) => (
                                                        <div className="overflow-x-auto my-4 rounded-xl border border-white/10 bg-white/5">
                                                            <table className="w-full border-collapse" {...props} />
                                                        </div>
                                                    ),
                                                    thead: ({...props}) => <thead className="bg-white/10" {...props} />,
                                                    th: ({...props}) => <th className="px-4 py-2 text-left text-xs font-bold uppercase text-white/50 border-b border-white/10" {...props} />,
                                                    td: ({...props}) => <td className="px-4 py-2 border-b border-white/10 text-sm text-white/70" {...props} />,
                                                    strong: ({...props}) => <strong className="text-gold font-bold" {...props} />,
                                                    code: ({...props}) => <code className="bg-white/10 px-1.5 py-0.5 rounded text-gold text-sm" {...props} />,
                                                    blockquote: ({...props}) => <blockquote className="border-l-4 border-gold/50 pl-4 py-1 my-4 italic text-white/60" {...props} />,
                                                }}
                                            >
                                                {msg.content}
                                            </ReactMarkdown>
                                        ) : (
                                            msg.content.split('\n').map((line, idx) => (
                                                <React.Fragment key={idx}>
                                                    {line}
                                                    <br />
                                                </React.Fragment>
                                            ))
                                        )}
                                    </div>
                                </div>
                            ))}
                            {isInteracting && (
                                <div className="flex gap-4 animate-pulse">
                                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                                        <Bot size={16} className="text-primary/50" />
                                    </div>
                                    <div className="bg-white/5 border border-white/10 p-4 rounded-2xl rounded-tl-none">
                                        <div className="flex gap-1">
                                            <div className="w-1.5 h-1.5 rounded-full bg-white/20 animate-bounce"></div>
                                            <div className="w-1.5 h-1.5 rounded-full bg-white/20 animate-bounce [animation-delay:0.2s]"></div>
                                            <div className="w-1.5 h-1.5 rounded-full bg-white/20 animate-bounce [animation-delay:0.4s]"></div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Input Area */}
                        {!isPassed ? (
                            <form 
                                onSubmit={handleSendMessage}
                                className="p-4 sm:p-6 bg-[#0d1726] border-t border-white/10"
                            >
                                <div className="relative group">
                                    <input 
                                        value={inputValue}
                                        onChange={(e) => setInputValue(e.target.value)}
                                        placeholder="Type your question here..."
                                        className="w-full bg-white/5 border border-white/10 focus:border-gold/50 rounded-2xl py-4 pl-5 pr-14 text-white placeholder:text-white/20 outline-none transition-all"
                                    />
                                    <button 
                                        type="submit"
                                        disabled={!inputValue.trim() || isInteracting}
                                        className="absolute right-2 top-2 bottom-2 w-10 bg-gold text-white rounded-xl flex items-center justify-center hover:bg-gold2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                    >
                                        <Send size={18} />
                                    </button>
                                </div>
                                <div className="mt-3 flex items-center justify-center gap-2">
                                    <Sparkles size={12} className="text-gold/50" />
                                    <span className="text-[10px] text-white/30 uppercase tracking-[1px] font-medium">AI-Powered Skill Coaching</span>
                                </div>
                            </form>
                        ) : (
                            <div className="p-4 sm:p-6 bg-[#0d1726] border-t border-white/10 flex flex-col items-center">
                                <button 
                                    onClick={onClose}
                                    className="w-full h-14 bg-green-600 hover:bg-green-700 text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-3 text-[15px]"
                                >
                                    <ShieldCheck size={20} />
                                    Close Learning Session
                                </button>
                                <div className="mt-3 flex items-center justify-center gap-2">
                                    <Sparkles size={12} className="text-gold/50" />
                                    <span className="text-[10px] text-white/30 uppercase tracking-[1px] font-medium">Competency Achieved!</span>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    // START SESSION VIEW
                    <div className="p-8">
                        {/* Close Button */}
                        <button 
                            onClick={onClose}
                            className="absolute top-6 right-6 text-white/30 hover:text-white transition-colors"
                        >
                            <X size={24} />
                        </button>

                        {/* Content */}
                        <div className="mb-8">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 border border-gold/20 text-gold text-[10px] font-bold uppercase tracking-widest mb-4">
                                {status === 'in_progress' ? (
                                    <div className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse"></div>
                                ) : (
                                    <Zap size={12} fill="currentColor" />
                                )}
                                {status === 'in_progress' ? 'Session in Progress' : 'Ready to Start'}
                            </div>
                            <h3 className="text-white font-serif font-bold text-2xl mb-2">
                                {competency.title}
                            </h3>
                            <div className="text-white/40 text-[11px] font-mono mb-4">
                                COMPETENCY ID: {competency.code || competency.id}
                            </div>
                            <p className="text-white/60 text-[14px] leading-relaxed">
                                {competency.description}
                            </p>
                        </div>

                        {/* Features/Info */}
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-8 space-y-4">
                            <div className="flex items-start gap-4">
                                <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center shrink-0">
                                    <PlayCircle size={18} className="text-gold" />
                                </div>
                                <div>
                                    <div className="text-[13px] font-bold text-white mb-0.5">Interactive AI Session</div>
                                    <div className="text-[11px] text-white/40">Step-by-step guided learning and real-time feedback</div>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center shrink-0">
                                    <ShieldCheck size={18} className="text-gold" />
                                </div>
                                <div>
                                    <div className="text-[13px] font-bold text-white mb-0.5">Proof of Skill Verification</div>
                                    <div className="text-[11px] text-white/40">Your progress is verified against EQF-aligned rubrics</div>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <button 
                            onClick={handleStartSession}
                            disabled={isStarting || isInteracting}
                            className="w-full cursor-pointer h-14 bg-gold hover:bg-gold2 disabled:bg-gold/50 disabled:cursor-not-allowed text-white font-bold rounded-2xl shadow-[0_4px_0_#9a7e3a] hover:translate-y-[1px] hover:shadow-[0_3px_0_#9a7e3a] transition-all flex items-center justify-center gap-3 text-[15px]"
                        >
                            {isStarting || isInteracting ? (
                                <>
                                    <Loader2 size={20} className="animate-spin" />
                                    Initializing Session...
                                </>
                            ) : (
                                <>
                                    <PlayCircle size={20} />
                                    {status === 'in_progress' ? 'Resume Learning Session' : 'Start Learning Session'}
                                </>
                            )}
                        </button>
                        
                        <button 
                            onClick={onClose}
                            disabled={isStarting || isInteracting}
                            className="w-full mt-3 text-white/30 hover:text-white text-[12px] font-medium transition-all"
                        >
                            Maybe Later
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
