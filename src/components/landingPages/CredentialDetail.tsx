import { useSearchParams, useRouter } from "next/navigation";
import { useGetLessonCompetenciesQuery } from "@/redux/features/lesson/lessonCompetenciesApi";
import { 
    useCheckAccessQuery 
} from "@/redux/features/enrollment/EnrollmentManagementapi";
import { useMemo, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Check, CreditCard, X, ShieldCheck, Globe, BookOpen, Zap } from "lucide-react";

import { skipToken } from "@reduxjs/toolkit/query";
import { cn } from "@/lib/utils";
import { LearningSessionModal } from "../learning/LearningSessionModal";
 import { useGetSessionsQuery, useGetCompetencyRoadmapQuery } from "@/redux/features/learning/LearningSessionApi";
import { LearningSessionDetailsModal } from "../learning/LearningSessionDetailsModal";
import { toast } from "sonner";
export const CredentialDetail = () => {
    const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
    const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [selectedCompetency, setSelectedCompetency] = useState<any>(null);
    const [selectedSessionId, setSelectedSessionId] = useState<string | number | null>(null);
    const [mounted, setMounted] = useState(false);



    useEffect(() => {
        setMounted(true);
    }, []);
    const searchParams = useSearchParams();
    const router = useRouter();
    const id = searchParams.get("id");

    // Check if user already has access
    const mcId = id ? Number(id) : NaN;
    const { data: accessData } = useCheckAccessQuery(!isNaN(mcId) ? mcId : skipToken);
    const canAccess = accessData?.access?.can_access;

    // Fetch data from API using micro_credential_id
    const { data: apiResponse, isLoading, isError } = useGetLessonCompetenciesQuery(
        !isNaN(mcId) ? { micro_credential_id: mcId } : skipToken
    );

    // Fetch all sessions for this micro-credential to check status
    const { data: sessionsData } = useGetSessionsQuery(
        canAccess && !isNaN(mcId) 
            ? { micro_credential: mcId } 
            : skipToken
    );

    const { data: roadmapData } = useGetCompetencyRoadmapQuery(
        canAccess && !isNaN(mcId) ? mcId : skipToken
    );

    const roadmapStatusMap = useMemo(() => {
        const map: Record<number, string> = {};
        roadmapData?.roadmap?.competencies?.forEach((c: any) => {
            map[c.competency_id] = c.status;
        });
        return map;
    }, [roadmapData]);

    const competencyStatusMap = useMemo(() => {
        const map: Record<number, { status: string; sessionId: string | number }> = {};
        sessionsData?.sessions?.forEach(s => {
            const compId = Number(s.competency_id);
            // If multiple sessions exist, we might want the latest or a priority (completed > in_progress)
            // For now, let's just map it.
            if (!map[compId] || s.status === 'completed') {
                map[compId] = { status: s.status, sessionId: s.id };
            }
        });
        return map;
    }, [sessionsData]);

    const completedCompetencyIds = useMemo(() => {
        return Object.entries(competencyStatusMap)
            .filter(([_, val]) => val.status === 'completed')
            .map(([id, _]) => Number(id));
    }, [competencyStatusMap]);

    const competencyToSessionMap = useMemo(() => {
        const map: Record<number, number | string> = {};
        Object.entries(competencyStatusMap).forEach(([compId, val]) => {
            if (val.status === 'completed') {
                map[Number(compId)] = val.sessionId;
            }
        });
        return map;
    }, [competencyStatusMap]);
    // Extract micro-credential and domain from the API response
    const { mc, domain } = useMemo(() => {
        if (!apiResponse?.data?.domains || apiResponse.data.domains.length === 0) {
            return { mc: null, domain: null };
        }

        const firstDomain = apiResponse.data.domains[0];
        const firstMC = firstDomain.micro_credentials?.[0] || null;
         
        
        return {
            mc: firstMC,
            domain: firstDomain
        };
    }, [apiResponse]);
     console.log("mc",mc);

    if (isLoading) {
        return (
            <div className="pt-[62px] min-h-screen bg-[#0a1628] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-gold border-t-transparent rounded-full animate-spin"></div>
                    <div className="text-white/60 font-mono text-sm tracking-widest uppercase animate-pulse">Loading Credential Details...</div>
                </div>
            </div>
        );
    }
 
    if (isError || !mc) {
        return (
            <div className="pt-[62px] min-h-screen bg-[#0a1628] flex items-center justify-center">
                <div className="bg-white/5 p-10 rounded-2xl border border-white/10 text-center max-w-md">
                    <div className="text-4xl mb-6">⚠️</div>
                    <h2 className="text-white text-xl font-bold mb-3">Credential Not Found</h2>
                    <p className="text-white/50 mb-8">The requested micro-credential could not be loaded. It may have been moved or removed.</p>
                    <button
                        onClick={() => router.push('/catalog')}
                        className="bg-gold text-white font-bold px-6 py-3 rounded-xl hover:bg-gold2 transition-all"
                    >
                        Back to Catalog
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="pt-[62px] min-h-screen bg-[#0a1628]">
            <div className="max-w-[1200px] mx-auto px-8 md:px-12 py-8 md:py-12 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-10">
                <div className="animate-in fade-in slide-in-from-left-4 duration-700">
                    <div className="text-sm text-white/50 hover:text-white mb-4 cursor-pointer flex items-center gap-2 transition-colors" onClick={() => router.push('/catalog')}>
                        ← Back to Catalog
                    </div>
                    <div className="text-[10px] font-semibold tracking-[1.5px] uppercase font-mono text-gold mb-2">
                        Domain: {domain?.domain}
                    </div>
                    <h1 className="font-serif font-bold text-[36px] text-white leading-tight mb-4">{mc.micro_credential}</h1>
                    <p className="text-[14.5px] text-white/60 leading-relaxed mb-8">
                        Master the verified competencies in {mc.micro_credential} as part of the {domain?.domain} domain. This IKON SKILLS™ Micro-Credential is quality assured and recognized internationally.
                    </p>

                    <div className="flex flex-wrap gap-8 mb-12">
                        <div>
                            <div className="text-[9.5px] font-semibold tracking-[1.2px] uppercase text-white/45 font-mono mb-1">ECTS Credits</div>
                            <div className="text-[15px] font-bold text-white">10 ECTS</div>
                        </div>
                        <div>
                            <div className="text-[9.5px] font-semibold tracking-[1.2px] uppercase text-white/45 font-mono mb-1">EQF Level</div>
                            <div className="text-[15px] font-bold text-white">EQF {mc.level || "6"}</div>
                        </div>
                        <div>
                            <div className="text-[9.5px] font-semibold tracking-[1.2px] uppercase text-white/45 font-mono mb-1">Competencies</div>
                            <div className="text-[15px] font-bold text-white">{mc.competencies?.length || 0} Core</div>
                        </div>
                        <div>
                            <div className="text-[9.5px] font-semibold tracking-[1.2px] uppercase text-white/45 font-mono mb-1">Assessment</div>
                            <div className="text-[15px] font-bold text-white">100% AI-Assessed</div>
                        </div>
                        <div className="w-full sm:w-auto">
                            <div className="text-[9.5px] font-semibold tracking-[1.2px] uppercase text-white/45 font-mono mb-1">Source</div>
                            <div className="text-[12.5px] font-bold text-white">{mc.source || "International Accreditation"}</div>
                        </div>
                    </div>

                    <div className="text-[11px] font-semibold tracking-[1px] uppercase font-mono text-white pb-2 border-b-2 border-white/10 mb-4">
                        Core Competencies
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-10">
                        {mc.competencies?.map((comp, i) => (
                            <button 
                                key={comp.id} 
                                onClick={() => {
                                    if (canAccess) {
                                        if (roadmapStatusMap[Number(comp.id)] === 'locked') {
                                            toast.error("Complete previous competency");
                                            return;
                                        }
                                        const sessionId = competencyToSessionMap[Number(comp.id)];
                                        if (sessionId) {
                                            setSelectedSessionId(sessionId);
                                            setIsDetailsModalOpen(true);
                                        } else {
                                            setSelectedCompetency(comp);
                                            setIsSessionModalOpen(true);
                                        }
                                    } else {
                                        setIsPricingModalOpen(true);
                                    }
                                }}
                                className={cn(
                                    "flex flex-col text-left gap-2 p-4 rounded-lg bg-white/5 border border-white/10 transition-all group relative",
                                    canAccess ? "hover:border-gold/40 hover:bg-gold/10 cursor-pointer" : "hover:border-white/20 cursor-pointer",
                                    competencyStatusMap[Number(comp.id)]?.status === 'completed' && "border-green-500/50 bg-green-500/5",
                                    competencyStatusMap[Number(comp.id)]?.status === 'in_progress' && "border-blue-500/50 bg-blue-500/5",
                                    competencyStatusMap[Number(comp.id)]?.status === 'failed' && "border-red-500/50 bg-red-500/5"
                                )}
                            >
                                <div className="flex items-center justify-between w-full">
                                    <div className="w-8 h-8 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center text-[10px] font-bold text-gold font-mono uppercase tracking-wider shrink-0 shadow-[0_0_15px_rgba(196,136,14,0.1)] group-hover:bg-gold/20 transition-all">C{String(i + 1).padStart(2, '0')}</div>
                                    <div className="flex items-center gap-2">
                                        {roadmapStatusMap[Number(comp.id)] && (
                                            <div className={cn(
                                                "px-2 py-0.5 rounded-full border text-[8px] font-bold uppercase tracking-wider flex items-center gap-1",
                                                roadmapStatusMap[Number(comp.id)] === 'completed' && "bg-green-500/20 border-green-500/30 text-green-500",
                                                roadmapStatusMap[Number(comp.id)] === 'in_progress' && "bg-blue-500/20 border-blue-500/30 text-blue-500",
                                                roadmapStatusMap[Number(comp.id)] === 'failed' && "bg-red-500/20 border-red-500/30 text-red-500",
                                                roadmapStatusMap[Number(comp.id)] === 'available' && "bg-gold/20 border-gold/30 text-gold",
                                                roadmapStatusMap[Number(comp.id)] === 'locked' && "bg-white/10 border-white/20 text-white/50"
                                            )}>
                                                {roadmapStatusMap[Number(comp.id)] === 'in_progress' && <div className="w-1 h-1 rounded-full bg-blue-500 animate-pulse"></div>}
                                                {roadmapStatusMap[Number(comp.id)] === 'completed' && <div className="w-1 h-1 rounded-full bg-green-500"></div>}
                                                {roadmapStatusMap[Number(comp.id)] === 'failed' && <div className="w-1 h-1 rounded-full bg-red-500"></div>}
                                                Roadmap: {roadmapStatusMap[Number(comp.id)].replace('_', ' ')}
                                            </div>
                                        )}
                                        {competencyStatusMap[Number(comp.id)]?.status === 'completed' && (
                                            <div className="px-2 py-0.5 rounded-full bg-green-500/20 border border-green-500/30 text-green-500 text-[8px] font-bold uppercase tracking-wider flex items-center gap-1">
                                                <div className="w-1 h-1 rounded-full bg-green-500"></div>
                                                Completed
                                            </div>
                                        )}
                                        {competencyStatusMap[Number(comp.id)]?.status === 'in_progress' && (
                                            <div className="px-2 py-0.5 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-500 text-[8px] font-bold uppercase tracking-wider flex items-center gap-1">
                                                <div className="w-1 h-1 rounded-full bg-blue-500 animate-pulse"></div>
                                                In Progress
                                            </div>
                                        )}
                                        {competencyStatusMap[Number(comp.id)]?.status === 'failed' && (
                                            <div className="px-2 py-0.5 rounded-full bg-red-500/20 border border-red-500/30 text-red-500 text-[8px] font-bold uppercase tracking-wider flex items-center gap-1">
                                                <div className="w-1 h-1 rounded-full bg-red-500"></div>
                                                Failed
                                            </div>
                                        )}
                                        {competencyStatusMap[Number(comp.id)]?.status === 'pending' && (
                                            <div className="px-2 py-0.5 rounded-full bg-yellow-500/20 border border-yellow-500/30 text-yellow-500 text-[8px] font-bold uppercase tracking-wider flex items-center gap-1">
                                                <div className="w-1 h-1 rounded-full bg-yellow-500 animate-pulse"></div>
                                                Pending
                                            </div>
                                        )}
                                        <div className="text-[9px] text-white/30 font-mono group-hover:text-gold/50 transition-colors">ID: {comp.code || comp.id}</div>
                                    </div>
                                </div>
                                <div className="text-[14px] font-bold text-white/90 leading-snug">{comp.title}</div>
                                <div className="text-[12px] text-white/50 leading-relaxed font-medium">{comp.description}</div>
                                {!canAccess && (
                                    <div className="mt-1 flex items-center gap-1.5 text-[10px] font-bold text-gold/60 uppercase tracking-tight">
                                        <ShieldCheck size={12} />
                                        Enroll to Start Session
                                    </div>
                                )}
                                {canAccess && !completedCompetencyIds.includes(Number(comp.id)) && (
                                    <div className="mt-1 flex items-center gap-1.5 text-[10px] font-bold text-white/30 uppercase tracking-tight group-hover:text-gold/60 transition-colors">
                                        <Zap size={12} />
                                        {competencyStatusMap[Number(comp.id)]?.status === 'in_progress' ? 'Resume Learning Session' : 'Start Learning Session'}
                                    </div>
                                )}
                            </button>
                        )) || (
                                <div className="col-span-full py-4 text-white/50 text-sm italic">Competency details are being finalized for this credential.</div>
                            )}
                    </div>

                    <div className="text-[11px] font-semibold tracking-[1px] uppercase font-mono text-white pb-2 border-b-2 border-white/10 mb-4">
                        Stackable Degree Pathways
                    </div>
                    <div className="flex flex-wrap gap-2 mb-10">
                        {["Applied AI & Automation", "Digital Intelligence & AI Operations", "Strategic Business Leadership"].map((path, idx) => (
                            <div key={idx} className="bg-white/5 border border-white/10 rounded-lg p-3 min-w-[200px]">
                                <div className="text-[9px] font-mono text-white/45 uppercase tracking-[0.8px] mb-1">Degree Pathway</div>
                                <div className="text-[12.5px] font-bold text-white">{path}</div>
                            </div>
                        ))}
                    </div>
                </div>

                <aside className="sticky top-[70px] h-fit animate-in fade-in slide-in-from-right-4 duration-700">
                    <div className="bg-gradient-to-br from-[#0f2240] to-[#0a1a30] rounded-2xl p-8 border border-gold/30 relative overflow-hidden mb-4 shadow-2xl">
                        <div className="absolute top-[-50px] right-[-50px] w-[150px] h-[150px] rounded-full bg-radial-gradient from-gold/20 to-transparent pointer-events-none"></div>
                        <div className="text-[32px] mb-3">🏅</div>
                        <div className="font-serif font-bold text-[21px] text-white mb-1 leading-tight">{mc.micro_credential}</div>
                        <div className="text-[12px] text-white/55 mb-6">IKON SKILLS™ Verified Micro-Credential</div>

                        <div className="space-y-4 mb-6">
                            <div className="flex justify-between text-[12px] pb-2 border-b border-white/10">
                                <span className="text-white/50">Quality Assured By</span>
                                <span className="text-white font-bold">EIU-Paris</span>
                            </div>
                            <div className="flex justify-between text-[12px] pb-2 border-b border-white/10">
                                <span className="text-white/50">Credential Format</span>
                                <span className="text-white font-bold">Digital Badge + PDF</span>
                            </div>
                            <div className="flex justify-between text-[12px] pb-2 border-b border-white/10">
                                <span className="text-white/50">ECTS Credits</span>
                                <span className="text-white font-bold">10 ECTS</span>
                            </div>
                            <div className="flex justify-between text-[12px] pb-2 border-b border-white/10">
                                <span className="text-white/50">EQF Level</span>
                                <span className="text-white font-bold">{mc.level || "6"}</span>
                            </div>
                            <div className="flex justify-between text-[12px]">
                                <span className="text-white/50">Assessment</span>
                                <span className="text-white font-bold">100% AI-Assessed</span>
                            </div>
                        </div>

                        {canAccess ? (
                            <button 
                                // onClick={() => router.push('/dashboard?tab=My Learning')} 
                                className="w-full bg-[#4ade80]/20 border border-[#4ade80]/50 text-[#4ade80] font-bold text-[13.5px] py-3 rounded-xl hover:bg-[#4ade80]/30 transition-all mb-3 flex items-center justify-center gap-2"
                            >
                                <BookOpen size={18} />
                                Already Enrolled · Resume Learning and achieve the certificate.
                            </button>
                        ) : (
                            <button 
                                onClick={() => setIsPricingModalOpen(true)} 
                                className="w-full bg-gold text-white font-bold text-[13.5px] py-3 rounded-xl shadow-[0_4px_0_#9a7e3a] hover:bg-gold2 hover:translate-y-[1px] hover:shadow-[0_3px_0_#9a7e3a] active:shadow-none active:translate-y-[4px] transition-all mb-3 text-center"
                            >
                                Enroll as Practitioner
                            </button>
                        )}
                        {canAccess && roadmapData?.roadmap?.mc_status === 'completed' && (
                            <button
                                onClick={() => router.push('/dashboard?tab=Certificates')}
                                className="w-full h-14 bg-white/5 border border-white/10 hover:bg-white/10 text-white text-[12px] font-black uppercase tracking-widest rounded-xl transition-all"
                            >
                                View Sample Certificate
                            </button>
                        )}
                    </div>

                    <div className="bg-white/5 border border-white/15 rounded-2xl p-6">
                        <div className="text-[10px] font-bold tracking-[1.5px] uppercase font-mono text-white/45 mb-4">
                            Accreditation · EIU-Paris
                        </div>
                        <div className="space-y-3">
                            {['European International University, Paris', 'ACBSP Accredited Programs', 'ASIC Premier Institution', 'QS Stars 5/5 Rated', 'EQF-Aligned Competency Design'].map((item, i) => (
                                <div key={i} className="flex items-center gap-2 text-[12.5px] text-white/80 pb-2 border-b border-white/5 last:border-0 last:pb-0">
                                    <span className="text-[#4ade80]">✓</span>
                                    {item}
                                </div>
                            ))}
                        </div>
                    </div>
                </aside>
            </div>

            {/* PRICING & PAYMENT MODAL */}
            {isPricingModalOpen && mounted && createPortal(
                <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4">
                    <div 
                        className="absolute inset-0 bg-[#040812]/95 backdrop-blur-xl animate-in fade-in duration-300"
                        onClick={() => setIsPricingModalOpen(false)}
                    ></div>
                    <div className="relative w-full max-w-[420px] bg-[#0a111e] border border-gold/30 rounded-2xl shadow-[0_0_100px_rgba(196,136,14,0.2)] overflow-hidden animate-in zoom-in-95 fade-in duration-300">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-gold/20 to-transparent p-6 pb-4 border-b border-white/10 flex justify-between items-start">
                            <div>
                                <h3 className="text-white font-serif font-bold text-xl">Enroll as Practitioner</h3>
                                <p className="text-white/50 text-[12px] mt-1">IKON SKILLS™ Certified Pathway</p>
                            </div>
                            <button 
                                onClick={() => setIsPricingModalOpen(false)}
                                className="text-white/40 hover:text-white transition-colors p-1"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6">
                            {/* Credential Card Summary */}
                            <div className="bg-white/5 rounded-xl p-4 mb-6 border border-white/10">
                                <div className="text-[10px] uppercase tracking-widest text-gold font-bold mb-1">Selected Credential</div>
                                <div className="text-white font-bold text-[15px]">{mc.micro_credential}</div>
                            </div>

                            {/* Price Section */}
                            <div className="text-center mb-8">
                                <div className="text-white/50 text-[13px] mb-1">Total Enrollment Fee</div>
                                <div className="flex items-center justify-center gap-2">
                                    <span className="text-[42px] font-serif font-bold text-white leading-none">
                                        14.99
                                    </span>
                                    <div className="flex flex-col items-start leading-none">
                                        <span className="text-gold font-bold text-[14px] uppercase">USD</span>
                                        <span className="text-white/30 text-[10px] mt-0.5">VAT Incl.</span>
                                    </div>
                                </div>
                            </div>

                            {/* Features */}
                            <div className="space-y-3 mb-8">
                                {[
                                    { icon: <ShieldCheck size={16} className="text-gold" />, text: "Lifetime Verifiable Credential" },
                                    { icon: <Globe size={16} className="text-gold" />, text: "International Recognition" },
                                    { icon: <Check size={16} className="text-gold" />, text: "100% Digital & AI Assessed" }
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-3 text-[13px] text-white/70">
                                        {item.icon}
                                        <span>{item.text}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Action */}
                            <button 
                                className="w-full bg-gold text-white font-bold py-4 rounded-xl shadow-[0_4px_0_#9a7e3a] hover:bg-gold2 hover:translate-y-[1px] hover:shadow-[0_3px_0_#9a7e3a] transition-all flex items-center justify-center gap-3"
                                onClick={() => {
                                    router.push(`/checkout?id=${id}`);
                                }}
                            >
                                <CreditCard size={18} />
                                Pay & Enroll Now
                            </button>
                            <p className="text-[10px] text-white/30 text-center mt-4 px-4 leading-relaxed">
                                By clicking 'Pay & Enroll Now', you agree to IKON SKILLS™ Terms of Service and Academic Integrity Policy.
                            </p>
                        </div>
                    </div>
                </div>,
                document.body
            )}
            {/* LEARNING SESSION MODAL */}
            {isSessionModalOpen && mounted && createPortal(
                <LearningSessionModal 
                    isOpen={isSessionModalOpen}
                    onClose={() => setIsSessionModalOpen(false)}
                    competency={selectedCompetency}
                    microCredentialId={mc.id}
                    domainId={domain?.id || 0}
                    status={selectedCompetency ? competencyStatusMap[Number(selectedCompetency.id)]?.status : undefined}
                />,
                document.body
            )}

            {/* SESSION DETAILS MODAL */}
            {isDetailsModalOpen && mounted && createPortal(
                <LearningSessionDetailsModal 
                    isOpen={isDetailsModalOpen}
                    onClose={() => setIsDetailsModalOpen(false)}
                    sessionId={selectedSessionId}
                />,
                document.body
            )}
        </div>
    );
};
