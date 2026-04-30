"use client";

import { useRouter } from "next/navigation";
import { 
    useGetEarnedCredentialsQuery, 
    useGetEnrolledCredentialsWithStateQuery 
} from "@/redux/features/practitioner/PractitionerManagementApi";
import { Loader2, BookOpen, Award } from "lucide-react";

export const MyCredentials = () => {
    const router = useRouter();
    const { data: earnedData, isLoading: isEarnedLoading } = useGetEarnedCredentialsQuery();
    const { data: enrolledData, isLoading: isEnrolledLoading } = useGetEnrolledCredentialsWithStateQuery();

    if (isEarnedLoading || isEnrolledLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-gold" />
            </div>
        );
    }

    const earnedCredentials = earnedData?.credentials || [];
    console.log("earnedCredentials", earnedCredentials);
    const enrolledCredentials = enrolledData?.micro_credentials || [];

    return (
        <div className="animate-in fade-in duration-500">
            {/* Active Enrollments Section */}
            <section className="mb-12">
                <div className="flex items-center gap-2 mb-4">
                    <BookOpen className="w-5 h-5 text-gold" />
                    <div className="text-[14.5px] font-bold text-white tracking-wide uppercase">Active Enrollments & Progress</div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {enrolledCredentials.length > 0 ? (
                        enrolledCredentials.map((mc, i) => {
                            const progress = mc.total_competencies > 0 
                                ? (mc.passed_competencies / mc.total_competencies) * 100 
                                : 0;
                            
                            const isNotStarted = mc.status === 'not_started';
                            const isCompleted = mc.status === 'completed';
                            
                            return (
                                <div key={i} className="bg-white/5 border border-white/10 rounded-[28px] p-6 transition-all hover:border-gold/40 group relative overflow-hidden flex flex-col h-full">
                                    {/* Glass Background Highlight */}
                                    <div className="absolute top-[-50px] right-[-50px] w-40 h-40 rounded-full bg-gold/5 group-hover:bg-gold/10 transition-colors pointer-events-none"></div>
                                    
                                    <div className="flex justify-between items-start mb-6 relative z-10">
                                        <div className="flex-1">
                                            <div className="text-white text-[17px] font-bold mb-2 group-hover:text-gold transition-colors leading-tight">{mc.micro_credential_name}</div>
                                            <div className="flex flex-wrap items-center gap-3">
                                                <span className={`text-[9px] font-bold px-2.5 py-1 rounded-full uppercase tracking-widest border ${
                                                    isNotStarted ? 'bg-white/5 border-white/10 text-white/40' : 
                                                    isCompleted ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                                                    'bg-gold/10 border-gold/20 text-gold'
                                                }`}>
                                                    {mc.status.replace('_', ' ')}
                                                </span>
                                                <span className="text-[10px] text-white/30 font-mono">ID: {mc.micro_credential_id}</span>
                                            </div>
                                        </div>
                                        <div className="text-right ml-4">
                                            <div className="text-gold text-[22px] font-bold font-serif leading-none mb-1">{Math.round(progress)}%</div>
                                            <div className="text-[9px] text-white/30 uppercase font-bold tracking-[1px]">Completed</div>
                                        </div>
                                    </div>

                                    {/* Progress Bar Container */}
                                    <div className="relative h-2 w-full bg-white/5 rounded-full mb-8 overflow-hidden">
                                        <div 
                                            className="absolute inset-y-0 left-0 bg-gradient-to-r from-gold to-gold2 transition-all duration-1000 shadow-[0_0_10px_rgba(212,175,55,0.3)]" 
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>

                                    <div className="grid grid-cols-3 gap-3 mb-8">
                                        <div className="bg-white/5 border border-white/5 rounded-2xl p-3 hover:border-white/10 transition-colors">
                                            <div className="text-white/30 text-[9px] uppercase font-bold mb-1.5 tracking-wider">Competencies</div>
                                            <div className="text-white text-[13px] font-bold font-mono">{mc.passed_competencies} <span className="text-white/20">/</span> {mc.total_competencies}</div>
                                        </div>
                                        <div className="bg-white/5 border border-white/5 rounded-2xl p-3 hover:border-white/10 transition-colors text-center">
                                            <div className="text-white/30 text-[9px] uppercase font-bold mb-1.5 tracking-wider">Attempts</div>
                                            <div className="text-white text-[13px] font-bold font-mono">{mc.attempts_used} <span className="text-white/20">/</span> {mc.max_attempts}</div>
                                        </div>
                                        <div className="bg-white/5 border border-white/5 rounded-2xl p-3 hover:border-white/10 transition-colors text-right">
                                            <div className="text-white/30 text-[9px] uppercase font-bold mb-1.5 tracking-wider">Points</div>
                                            <div className="text-gold text-[13px] font-bold font-mono">+{mc.gamification_points}</div>
                                        </div>
                                    </div>

                                    <div className="mt-auto flex items-center justify-between pt-4 border-t border-white/5">
                                        <div className="text-white/30 text-[9px] font-mono uppercase">Enrolled: {new Date(mc.enrolled_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                                        <button 
                                            onClick={() => router.push(`/sample-mc?id=${mc.micro_credential_id}`)}
                                            className="text-gold2 cursor-pointer text-[10px] font-bold uppercase tracking-[2px] flex items-center gap-2 hover:text-white transition-colors group/btn"
                                        >
                                            {isNotStarted ? 'Start Learning' : 'Continue Course'}
                                            <span className="w-5 h-5 rounded-lg bg-gold/10 flex items-center justify-center group-hover/btn:bg-gold group-hover/btn:text-white transition-all">→</span>
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="col-span-full text-white/40 text-[13px] py-16 text-center border border-dashed border-white/10 rounded-3xl bg-white/[0.02]">
                            No active enrollments found.
                        </div>
                    )}
                </div>
            </section>

            {/* Verified Credentials Section */}
            <section className="mb-12">
                <div className="flex items-center gap-2 mb-4">
                    <Award className="w-5 h-5 text-gold" />
                    <div className="text-[14.5px] font-bold text-white tracking-wide uppercase">Verified Micro-Credentials Wall</div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {earnedCredentials.length > 0 ? (
                        earnedCredentials.map((cred, i) => (
                            <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-5 text-center cursor-pointer transition-all hover:bg-gold/5 group relative overflow-hidden">
                                <div className="absolute top-[-20px] right-[-20px] w-40 h-40 rounded-full bg-radial-gradient from-gold/15 to-transparent pointer-events-none group-hover:scale-125 transition-transform duration-700"></div>
                                <div className="ec-ic text-[32px] mb-3">
                                    {cred.badge_url ? <img src={cred.badge_url} className="w-12 h-12 mx-auto" alt="Badge" /> : "🏅"}
                                </div>
                                <div className="space-y-4 mb-6 text-left">
                                    <div>
                                        <div className="text-white/30 text-[9px] font-mono uppercase tracking-wider mb-1">Domain Name</div>
                                        <div className="text-gold2 text-[12px] font-bold uppercase tracking-wide">{cred.domain_name || 'Verified Credential'}</div>
                                    </div>
                                    
                                    <div>
                                        <div className="text-white/30 text-[9px] font-mono uppercase tracking-wider mb-1">Credential Name</div>
                                        <div className="text-white text-[16px] font-bold leading-tight group-hover:text-gold transition-colors">{cred.micro_credential_name}</div>
                                    </div>

                                    <div className="flex justify-between items-end">
                                        <div>
                                            <div className="text-white/30 text-[9px] font-mono uppercase tracking-wider mb-1">Issued On</div>
                                            <div className="text-white/60 text-[11px] font-mono">{new Date(cred.issued_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-white/30 text-[9px] uppercase font-bold mb-1 tracking-wider">Credits</div>
                                            <div className="text-gold3 text-[11px] font-mono font-bold bg-gold/10 px-3 py-0.5 rounded-full inline-block">{cred.ects_earned} ECTS · {cred.eqf_level}</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-2 justify-center mt-auto border-t border-white/5 pt-4">
                                    <button 
                                        onClick={(e) => { 
                                            e.stopPropagation(); 
                                            const certData = encodeURIComponent(JSON.stringify(cred));
                                            router.push(`/certificate?id=${cred.micro_credential_id}&certData=${certData}`); 
                                        }}
                                        className="bg-gold hover:bg-gold2 text-white text-[10px] font-bold px-6 py-2.5 rounded-xl shadow-lg transition-all cursor-pointer transform hover:scale-105 active:scale-95"
                                    >
                                        View Certificate →
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full text-white/40 text-[13px] py-12 text-center border border-dashed border-white/10 rounded-2xl">
                            You haven't earned any micro-credentials yet.
                        </div>
                    )}
                </div>
            </section>

            <div className="eiu-mini bg-gradient-to-br from-[#060e1e] to-[#0d1a2e] border-t border-gold/40 rounded-3xl p-8 flex flex-col md:flex-row items-center gap-10">
                <div className="w-24 h-24 rounded-full border-4 border-gold/20 flex items-center justify-center p-2">
                    <img src="https://ikonmalta.ac/IKON_LOGO_White_Color.png" className="w-full h-auto object-contain grayscale opacity-60" />
                </div>
                <div className="flex-1 text-center md:text-left">
                    <div className="text-gold text-[10px] font-mono font-bold uppercase tracking-[2px] mb-1">Quality Assurance Body</div>
                    <div className="text-white text-[20px] font-bold font-serif mb-2">European International University, Paris</div>
                    <div className="text-white/50 text-[13px] leading-relaxed max-w-[600px]">
                        All Micro-Credentials listed above are accredited and quality assured by EIU-Paris,
                        mapped directly to the European Qualifications Framework (EQF).
                    </div>
                </div>
            </div>
        </div>
    );
};

