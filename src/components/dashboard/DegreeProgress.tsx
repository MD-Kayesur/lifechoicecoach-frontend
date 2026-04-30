"use client";
 
import { useRouter } from "next/navigation";
import { useGetDegreeProgressListQuery } from "@/redux/features/progress/degreeProgressApi";
import { Loader2, Award, BookOpen, TrendingUp } from "lucide-react";

export const DegreeProgress = () => {
    const router = useRouter();
    const { data, isLoading, isError } = useGetDegreeProgressListQuery();
    const progressList = data?.degree_progress || [];

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <Loader2 className="w-10 h-10 text-gold animate-spin" />
                <p className="text-white/30 font-mono text-[10px] uppercase tracking-widest">Loading Degree Progress...</p>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-8 text-center">
                <p className="text-red-400 text-sm">Failed to load degree progress. Please try again later.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="text-[14.5px] font-bold text-white mb-3 tracking-wide flex items-center gap-2">
                <TrendingUp size={18} className="text-gold" />
                University Degree Progress
            </div>

            {progressList.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {progressList.map((progress) => (
                        <div key={progress.id} className="bg-gradient-to-br from-[#0B1F3A] to-[#142E55] border border-gold/40 rounded-2xl p-6 relative overflow-hidden group hover:border-gold/60 transition-all duration-300">
                            <div className="absolute top-[-30px] right-[-30px] w-48 h-48 rounded-full bg-radial-gradient from-gold/15 to-transparent pointer-events-none group-hover:scale-125 transition-transform duration-700"></div>

                            <div className="flex items-start justify-between mb-8 relative z-10">
                                <div>
                                    <div className="text-gold text-[10px] font-mono font-bold uppercase tracking-[1.5px] mb-1">
                                        EQF Level {progress.eqf_level} · {progress.is_completed ? "Completed" : "In Progress"}
                                    </div>
                                    <div className="text-white text-[20px] font-bold font-serif mb-1 leading-tight">{progress.degree_name}</div>
                                    <div className="text-white/40 text-[11px] font-medium">{progress.user_email}</div>
                                </div>
                                <div className="text-[28px]"><Award className="text-gold" /></div>
                            </div>

                            <div className="relative z-10 mb-6">
                                <div className="flex justify-between items-center mb-1.5 text-[12px] text-white/70 font-mono">
                                    <span>{progress.progress_percentage.toFixed(2)}% Mastery</span>
                                    <span className="text-gold2 font-bold">{progress.mc_completed}/{progress.total_mc_required} Micro-Credentials</span>
                                </div>
                                <div className="bg-white/10 rounded-full h-[8px] overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-gold to-gold2 rounded-full transition-all duration-1000" style={{ width: `${progress.progress_percentage}%` }}></div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-6 relative z-10">
                                <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                                    <div className="text-white/30 text-[9px] font-mono uppercase mb-1">ECTS Accumulated</div>
                                    <div className="text-white text-[13px] font-bold">{progress.ects_accumulated} / {progress.total_ects_required}</div>
                                </div>
                                <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                                    <div className="text-white/30 text-[9px] font-mono uppercase mb-1">Started At</div>
                                    <div className="text-white text-[13px] font-bold">{new Date(progress.started_at).toLocaleDateString()}</div>
                                </div>
                            </div>

                            {/* <div className="relative z-10 pt-4 border-t border-white/5 flex gap-3">
                                <button 
                                    onClick={() => router.push('/dashboard?tab=My Learning')}
                                    className="bg-gold hover:bg-gold2 text-white text-[11px] font-bold px-6 py-2 rounded-lg shadow-lg transition-colors cursor-pointer"
                                >
                                    {progress.is_completed ? "View Final Degree" : "Resume Coursework"}
                                </button>
                            </div> */}
                        </div>
                    ))}

                </div>
            ) : (
                <div className="bg-white/5 border border-dashed border-white/10 rounded-2xl p-12 text-center animate-in fade-in duration-700">
                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                        <BookOpen className="text-white/20" size={32} />
                    </div>
                    <h3 className="text-white font-bold text-[16px] mb-2">No Active Degree Pathways</h3>
                    <p className="text-white/40 text-[13px] max-w-[300px] mx-auto mb-6">
                        You haven't started tracking any degree programs yet. Start by enrolling in an accredited pathway.
                    </p>
                    <button className="bg-gold hover:bg-gold2 text-white text-[12px] font-bold px-8 py-3 rounded-xl transition-all shadow-[0_10px_20px_rgba(203,45,57,0.2)]">
                        Explore Degree Pathways
                    </button>
                </div>
            )}
        </div>
    );
};
