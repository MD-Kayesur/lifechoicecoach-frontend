"use client";

import { useRouter } from "next/navigation";
import { 
    useGetCompletedCredentialsQuery, 
    useGetInProgressMCsQuery, 
    useGetEnrolledMCsQuery 
} from "@/redux/features/practitioner/PractitionerManagementApi";
import { Loader2 } from "lucide-react";

export const MyLearning = () => {
    const router = useRouter();
    const { data: completedData, isLoading: isCompletedLoading } = useGetCompletedCredentialsQuery();
    console.log("completedData",completedData);
    const { data: inProgressData, isLoading: isInProgressLoading } = useGetInProgressMCsQuery();
    console.log("inProgressData",inProgressData);
    const { data: enrolledData, isLoading: isEnrolledLoading } = useGetEnrolledMCsQuery();
    console.log("enrolledData",enrolledData);

    if (isCompletedLoading || isInProgressLoading || isEnrolledLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-gold" />
            </div>
        );
    }

    const completedCount = completedData?.total_count || 0;
    const inProgressCount = inProgressData?.total_count || 0;
    const enrolledCount = enrolledData?.total_count || 0;

    const stats = [
        { n: completedCount, l: 'Completed MCs', g: true },
        { n: inProgressCount, l: 'Courses in Progress' },
        { n: enrolledCount, l: 'Enrolled MCs' },
    ];

    return (
        <div className="animate-in fade-in duration-500">
            <div className="text-[14.5px] font-bold text-white mb-3 tracking-wide">Academic & Professional Learning</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-5 transition-all hover:border-gold/40">
                        <div className={`font-serif text-[32px] font-bold text-white mb-0.5 ${stat.g ? 'text-gold' : ''}`}>{stat.n}</div>
                        <div className="text-[12px] text-white/50 font-medium">{stat.l}</div>
                    </div>
                ))}
            </div>

            <div className="d-st text-[14.5px] font-bold text-white mb-4">Enrolled & In-Progress MCs</div>
            <div className="space-y-4">
                {enrolledData?.micro_credentials && enrolledData.micro_credentials.length > 0 ? (
                    enrolledData.micro_credentials.map((mc, i) => (
                        <div 
                            key={i} 
                            onClick={() => router.push(`/sample-mc?id=${mc.id}`)}
                            className="bg-white/5 border border-white/10 rounded-2xl p-6 relative overflow-hidden group hover:border-gold/30 cursor-pointer"
                        >
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center text-2xl group-hover:bg-gold/20 transition-all">📖</div>
                                <div className="flex-1">
                                    <div className="text-[17px] font-bold text-white mb-1">{mc.name}</div>
                                    <div className="text-[11px] text-white/40 font-mono font-bold tracking-widest uppercase mb-4">
                                        {mc.passed_competency_count}/{mc.total_competency_count} Competencies Passed
                                    </div>
                                    <div className="bg-white/10 rounded-full h-[6px] mb-2 overflow-hidden">
                                        <div 
                                            className="h-full bg-gradient-to-r from-gold to-gold2 rounded-full" 
                                            style={{ width: `${(mc.passed_competency_count / (mc.total_competency_count || 1)) * 100}%` }}
                                        ></div>
                                    </div>
                                    <div className="flex justify-between items-center text-[10px] text-white/60 font-mono">
                                        <span>Status: <span className="text-gold font-bold uppercase">{mc.status}</span></span>
                                        <span className="text-white/40">Enrolled: {new Date(mc.enrollment_date).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-white/40 text-[13px] py-12 text-center border border-dashed border-white/10 rounded-2xl">
                        No micro-credentials found in your learning history.
                    </div>
                )}
            </div>
        </div>
    );
};

