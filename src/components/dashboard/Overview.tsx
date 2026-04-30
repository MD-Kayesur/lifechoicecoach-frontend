"use client";

import { useRouter } from "next/navigation";
import { 
    useGetDashboardOverviewQuery, 
    useGetInProgressMCsQuery, 
    useGetECTSAccumulationQuery,
    useGetEarnedCredentialsQuery
} from "@/redux/features/practitioner/PractitionerManagementApi";
import { Loader2, Award, GraduationCap, BookOpen, CheckCircle } from "lucide-react";

export const Overview = () => {
    const router = useRouter();
    const { data: overviewData, isLoading: isOverviewLoading } = useGetDashboardOverviewQuery();
    const { data: inProgressData, isLoading: isInProgressLoading } = useGetInProgressMCsQuery();
    const { data: ectsData, isLoading: isEctsLoading } = useGetECTSAccumulationQuery();
    const { data: earnedData, isLoading: isEarnedLoading } = useGetEarnedCredentialsQuery();

    if (isOverviewLoading || isInProgressLoading || isEctsLoading || isEarnedLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-gold" />
            </div>
        );
    }

    const dashboard = overviewData?.dashboard;
    const inProgress = inProgressData?.in_progress || [];
    const ects = ectsData?.ects_data;
    const lastEarned = earnedData?.credentials?.[0];

    const stats = [
        { n: dashboard?.credentials_earned || '0', l: 'Credentials Earned', g: true, icon: Award },
        { n: dashboard?.ects_accumulated || '0', l: 'ECTS Accumulated', icon: GraduationCap },
        { n: dashboard?.in_progress_count || '0', l: 'In Progress', icon: BookOpen },
        { n: dashboard?.competencies_verified || '0', l: 'Competencies Verified', icon: CheckCircle }
    ];

    return (
        <div className="animate-in fade-in duration-500">
            <div className="mb-8">
                <h1 className="text-[24px] font-bold text-white mb-1">Welcome back, {dashboard?.practitioner_name}</h1>
                <p className="text-white/45 text-[13px] font-mono">Practitioner ID: {dashboard?.practitioner_id}</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-5 transition-all hover:border-gold/30 hover:bg-white/[0.07] group">
                        <div className="flex justify-between items-start mb-3">
                            <div className={`font-serif text-[32px] font-bold text-white ${stat.g ? 'text-gold' : ''}`}>{stat.n}</div>
                            <stat.icon className={`w-5 h-5 ${stat.g ? 'text-gold' : 'text-white/30'} group-hover:scale-110 transition-transform`} />
                        </div>
                        <div className="text-[12px] text-white/55 font-medium leading-tight">{stat.l}</div>
                    </div>
                ))}
            </div>

            <section className="mb-8">
                <div className="text-[14.5px] font-bold text-white mb-3 tracking-wide">Currently In Progress</div>
                <div className="space-y-2">
                    {inProgress.length > 0 ? (
                        inProgress.map((prog, i) => (
                            <div 
                                key={i} 
                                onClick={() => router.push(`/sample-mc?id=${prog.micro_credential_id}`)}
                                className="bg-white/5 border border-white/10 rounded-xl p-4 transition-all hover:border-gold/50 cursor-pointer flex justify-between items-center gap-4 group"
                            >
                                <div className="flex-1">
                                    <div className="text-[14px] font-bold text-white mb-1 group-hover:text-gold transition-colors">{prog.micro_credential_name}</div>
                                    <div className="text-[10.5px] text-white/45 font-mono mb-2 uppercase tracking-wide">{prog.domain_name || 'Curriculum'}</div>
                                    <div className="bg-white/10 rounded-full h-[5px] mb-1 overflow-hidden">
                                        <div className="h-full bg-gradient-to-r from-gold to-gold2 rounded-full" style={{ width: `${prog.progress_percentage}%` }}></div>
                                    </div>
                                    <div className="text-[10px] text-white/45 font-mono">{Math.round(prog.progress_percentage)}% complete · {prog.passed_competencies} / {prog.total_competencies} Competencies</div>
                                </div>
                                <div className="text-[10px] font-bold px-2.5 py-1 rounded-md bg-gold/20 text-[#f06070] font-mono whitespace-nowrap uppercase tracking-widest">{prog.status.replace('_', ' ')}</div>
                            </div>
                        ))
                    ) : (
                        <div className="text-white/40 text-[13px] py-4 text-center border border-dashed border-white/10 rounded-xl">No micro-credentials in progress</div>
                    )}
                </div>
            </section>

            {/* {lastEarned && (
                <section>
                    <div className="text-[14.5px] font-bold text-white mb-3 tracking-wide">Last Earned Credential</div>
                    <div className="bg-gradient-to-br from-[#0B1F3A] to-[#142E55] border border-gold/40 rounded-2xl p-6 relative overflow-hidden group">
                        <div className="absolute top-[-40px] right-[-40px] w-48 h-48 rounded-full bg-radial-gradient from-gold/20 to-transparent pointer-events-none group-hover:scale-125 transition-transform duration-700"></div>
                        <div className="flex items-center gap-6 relative z-10">
                            <div className="text-[48px]">{lastEarned.badge_url ? <img src={lastEarned.badge_url} className="w-16 h-16" alt="Badge" /> : '🏅'}</div>
                            <div>
                                <div className="text-gold text-[10px] font-mono font-bold uppercase tracking-[1.5px] mb-1">Latest Awarded</div>
                                <div className="text-white text-[22px] font-bold font-serif mb-1 leading-tight">{lastEarned.name}</div>
                                <div className="text-white/60 text-[13px] mb-4">{lastEarned.ects} ECTS · EQF Level {lastEarned.level} · Verified by EIU-Paris</div>
                                <div className="flex gap-3">
                                    <button className="bg-gold text-white text-[11px] font-bold px-4 py-1.5 rounded-lg">Share Certificate</button>
                                    <button className="bg-white/10 text-white/80 text-[11px] font-bold px-4 py-1.5 rounded-lg border border-white/10">Verification ID: {lastEarned.certificate_id || 'N/A'}</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            )} */}
        </div>
    );
};

