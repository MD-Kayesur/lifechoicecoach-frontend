"use client";

import { useRouter } from "next/navigation";
import { useGetInProgressMCsQuery } from "@/redux/features/practitioner/PractitionerManagementApi";
import { Loader2, TrendingUp, BookOpen, ChevronRight } from "lucide-react";

export const Progress = () => {
    const router = useRouter();
    const { data: inProgressData, isLoading } = useGetInProgressMCsQuery();
    const inProgress = inProgressData?.in_progress || [];

    return (
        <div className="animate-in fade-in duration-500 space-y-10">
            {/* Top Header */}
            <div className="flex items-center gap-3">
                <TrendingUp className="w-6 h-6 text-gold" />
                <h2 className="text-[20px] font-bold text-white italic font-serif">Detailed Skills Progress</h2>
            </div>

            {/* In Progress Micro-Credentials Section */}
            <section className="bg-white/5 border border-white/10 rounded-3xl p-8 relative overflow-hidden">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <div className="text-[15px] font-bold text-white mb-1 tracking-wide uppercase">Active Curriculum Progress</div>
                        <p className="text-white/40 text-[11px]">Real-time assessment tracking for currently enrolled MCs</p>
                    </div>
                    <BookOpen className="w-6 h-6 text-white/10" />
                </div>

                <div className="space-y-4">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="w-8 h-8 text-gold animate-spin" />
                        </div>
                    ) : inProgress.length > 0 ? (
                        inProgress.map((mc, i) => (
                            <div key={i} className="bg-white/5 border border-white/5 rounded-2xl p-6 hover:border-gold/30 transition-all group/mc">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-6">
                                    <div className="flex-1">
                                        <div className="text-white text-[16px] font-bold mb-1 group-hover/mc:text-gold transition-colors">{mc.micro_credential_name}</div>
                                        <div className="flex items-center gap-3">
                                            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-widest border ${
                                                mc.status === 'not_started' ? 'bg-white/5 border-white/10 text-white/40' : 'bg-gold/10 border-gold/20 text-gold'
                                            }`}>
                                                {mc.status.replace('_', ' ')}
                                            </span>
                                            <span className="text-[10px] text-white/30 font-mono">Domain: {mc.domain_name}</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-gold text-[20px] font-bold font-serif italic leading-none mb-1">{Math.round(mc.progress_percentage)}%</div>
                                        <div className="text-[9px] text-white/30 uppercase font-bold tracking-[1px]">Total Progress</div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-gradient-to-r from-gold to-gold2 transition-all duration-1000 shadow-[0_0_15px_rgba(212,175,55,0.3)]" 
                                            style={{ width: `${mc.progress_percentage}%` }}
                                        />
                                    </div>
                                    
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        <div className="bg-white/5 border border-white/5 rounded-xl p-2.5">
                                            <div className="text-white/30 text-[9px] uppercase font-bold mb-1">Competencies</div>
                                            <div className="text-white text-[12px] font-bold font-mono">{mc.passed_competencies} / {mc.total_competencies}</div>
                                        </div>
                                        <div className="bg-white/5 border border-white/5 rounded-xl p-2.5">
                                            <div className="text-white/30 text-[9px] uppercase font-bold mb-1">Attempts</div>
                                            <div className="text-white text-[12px] font-bold font-mono">{mc.attempts_used} / {mc.max_attempts}</div>
                                        </div>
                                        <div className="bg-white/5 border border-white/5 rounded-xl p-2.5">
                                            <div className="text-white/30 text-[9px] uppercase font-bold mb-1">Enrolled On</div>
                                            <div className="text-white text-[12px] font-bold font-mono">{new Date(mc.enrolled_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                                        </div>
                                        <div className="flex items-center justify-end">
                                            <button 
                                                onClick={() => router.push(`/sample-mc?id=${mc.micro_credential_id}`)}
                                                className="text-gold2 text-[10px] cursor-pointer font-bold uppercase tracking-[2px] flex items-center gap-2 hover:text-white transition-colors group/btn"
                                            >
                                                {mc.status === 'not_started' ? 'Start' : 'Continue'}
                                                <span className="w-5 h-5 rounded-lg bg-gold/10 flex items-center justify-center group-hover/btn:bg-gold group-hover/btn:text-white transition-all">→</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-white/40 text-[13px] py-16 text-center border border-dashed border-white/10 rounded-2xl bg-white/[0.02]">
                            No micro-credentials currently in progress.
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};
