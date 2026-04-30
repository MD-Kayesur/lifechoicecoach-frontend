"use client";

import { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import { DEGREES, CERTS } from "@/lib/data";
import { useGetDegreeCatalogQuery } from "@/redux/features/degree/degreePathwaysApi";

export const Degrees = () => {
    const [activeFilter, setActiveFilter] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [expandedDegrees, setExpandedDegrees] = useState<number[]>([]);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const toggleDegree = (id: number) => {
        setExpandedDegrees(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const { data: catalogData, isLoading } = useGetDegreeCatalogQuery();

    const mappedDegrees = useMemo(() => {
        if (isLoading) return [];
        if (!catalogData?.success || !catalogData?.degree_catalog) return DEGREES;

        const allDegrees: any[] = [];
        catalogData.degree_catalog.degree_types.forEach(type => {
            if (type.degrees && Array.isArray(type.degrees)) {
                type.degrees.forEach(deg => {
                    allDegrees.push({
                        id: deg.id,
                        level: deg.degree_type || type.title,
                        name: deg.name,
                        mcs: (deg.required_micro_credentials || []).map((mc: any) => mc.name),
                        mc_count: deg.mc_required || (deg.required_micro_credentials?.length || 0),
                        ects: deg.ects_required || 180,
                        eqf: deg.eqf_level || 6,
                        partner: (deg.co_endorser === "-" || !deg.co_endorser) ? null : deg.co_endorser
                    });
                });
            }
        });
        return allDegrees;
    }, [catalogData]);

    const filteredDegrees = useMemo(() => {
        const query = searchQuery.toLowerCase().trim();
        return mappedDegrees.filter(deg => {
            const levelMatch = activeFilter === 'all' || deg.level === activeFilter;
            const searchMatch = !query ||
                deg.name.toLowerCase().includes(query) ||
                deg.mcs.some((mc: any) => mc.toLowerCase().includes(query));
            return levelMatch && searchMatch;
        });
    }, [activeFilter, searchQuery, mappedDegrees]);

    const filteredCerts = useMemo(() => {
        const query = searchQuery.toLowerCase().trim();
        return CERTS.filter(cert => {
            const levelMatch = activeFilter === 'all' || activeFilter === 'Cert';
            const searchMatch = !query ||
                cert.name.toLowerCase().includes(query) ||
                cert.mcs.some(mc => mc.toLowerCase().includes(query));
            return levelMatch && searchMatch;
        });
    }, [activeFilter, searchQuery]);

    const groups = useMemo(() => {
        const baseGroups = (catalogData?.degree_catalog?.degree_types || []).map(type => ({
            id: type.title,
            label: `${type.title} Degrees`,
            items: filteredDegrees.filter(d => d.level === type.title)
        }));

        // If no API data, fallback to defaults for consistency
        if (baseGroups.length === 0) {
            baseGroups.push(
                { id: 'Bachelor', label: 'Bachelor Degrees', items: filteredDegrees.filter(d => d.level === 'Bachelor') },
                { id: 'Master', label: 'Master Degrees', items: filteredDegrees.filter(d => d.level === 'Master') },
                { id: 'Doctorate', label: 'Doctorate Degrees', items: filteredDegrees.filter(d => d.level === 'Doctorate') }
            );
        }

        baseGroups.push({ id: 'Cert', label: 'Brand Strategy Certifications', items: filteredCerts });
        return baseGroups;
    }, [catalogData, filteredDegrees, filteredCerts]);

    const totalCount = mappedDegrees.length + CERTS.length;

    const getFilterStyle = (id: string, isActive: boolean) => {
        if (!isActive) return 'bg-white/5 border-white/12 text-[#94A3B8]';
        
        switch(id) {
            case 'all': return 'bg-[#a02030] border-gold text-white';
            case 'Bachelor': return 'bg-[#1E6B8C]/40 border-[#1E6B8C] text-white';
            case 'Master': return 'bg-gold/30 border-gold text-[#cb2d39]';
            case 'Doctorate': return 'bg-[#8a1a26]/40 border-gold text-[#FF8080]';
            case 'Cert': return 'bg-[#4a1e6b]/40 border-[#9B59B6] text-[#C39BD3]';
            default: return 'bg-gold/20 border-gold/50 text-gold';
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#070c14] flex flex-col items-center justify-center relative overflow-hidden font-outfit">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(203,45,57,0.05)_0%,transparent_70%)]"></div>
                <div className="relative z-10 flex flex-col items-center">
                    <div className="w-16 h-16 border-4 border-gold/20 border-t-gold rounded-full animate-spin mb-6"></div>
                    <div className="text-white/50 text-[13px] font-medium tracking-[3px] uppercase animate-pulse">
                        Assembling Degree Pathways...
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div id="page-degrees" className="page active pt-[62px] min-h-screen bg-[#070c14] relative overflow-hidden font-outfit">
            {/* ═══════ ABSTRACT BACKGROUND ═══════ */}
            <div className="bg-canvas fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="bg-grid absolute inset-0 bg-[linear-gradient(rgba(203,45,57,.04)_1px,transparent_1px),linear-gradient(90deg,rgba(203,45,57,.04)_1px,transparent_1px)] bg-[size:60px_60px]"></div>
                <div className="bg-dots absolute inset-0 bg-[radial-gradient(circle,rgba(203,45,57,.08)_1px,transparent_1px)] bg-[size:30px_30px] bg-[15px_15px] opacity-50"></div>
                <div className="bg-lines absolute inset-0 overflow-hidden opacity-[0.03] before:content-[''] before:absolute before:w-[200%] before:height-[1px] before:bg-[linear-gradient(90deg,transparent,var(--gold),transparent)] before:top-[30%] before:left-[-50%] before:rotate-[-15deg] before:shadow-[0_80px_0_rgba(203,45,57,.5),0_160px_0_rgba(203,45,57,.3),0_240px_0_rgba(203,45,57,.2),0_-80px_0_rgba(203,45,57,.4),0_-160px_0_rgba(203,45,57,.2)]"></div>
                <div className="bg-shape bg-shape-1 absolute w-[600px] h-[600px] border border-gold/10 rounded-full top-[-200px] right-[-100px] blur-[1px] opacity-4 animate-[spin_40s_linear_infinite]"></div>
                <div className="bg-shape bg-shape-2 absolute w-[400px] h-[400px] border border-gold/10 rounded-full top-[20%] left-[-150px] blur-[1px] opacity-3 animate-[spin_55s_linear_infinite_reverse]"></div>
                <div className="bg-shape bg-shape-3 absolute w-[300px] h-[300px] border border-gold/10 rounded-full bottom-[10%] right-[5%] blur-[1px] opacity-3 animate-[spin_35s_linear_infinite]"></div>
            </div>

            <div className="page-content relative z-1">
                {/* HERO */}
                <div className="cp-hero bg-[linear-gradient(135deg,#040810_0%,#070C14_50%,#0A1020_100%)] px-10 py-20 text-center relative overflow-hidden border-b border-gold/30">
                    <div className="hero-badge inline-block bg-gold/12 border border-gold/40 text-gold text-[11px] font-semibold tracking-[2px] uppercase px-4.5 py-1.5 rounded-full mb-6">
                        IKON SKILLS™ Stackable Degrees
                    </div>
                    <h1 className="font-sora font-extrabold text-white text-[28px] md:text-[52px] leading-[1.1] mb-4 tracking-[-.5px]">
                        {totalCount} Degree Programs.<br /><span className="text-gold">Built from Micro-Credentials.</span>
                    </h1>
                    <p className="text-[#94A3B8] text-[16px] max-w-[680px] mx-auto mb-10 leading-[1.7]">
                        Every degree is assembled from verified IKON SKILLS™ Micro-Credentials. Stack your credentials. Earn your qualification. No traditional lectures required.
                    </p>
                    <div className="hero-stats flex justify-center gap-10 flex-wrap mb-10">
                        {[
                            { n: String(catalogData?.degree_catalog?.total_degrees || totalCount), l: 'Degree Programs' },
                            { n: String(mappedDegrees.length), l: 'Academic Programs' },
                            { n: String(mappedDegrees.filter(d => d.name.includes('Education') || d.name.includes('MEd')).length), l: 'Education Degrees' },
                            { n: String(CERTS.length), l: 'Brand Certifications' }
                        ].map((stat, i) => (
                            <div key={i} className="hero-stat text-center">
                                <div className="num font-mono text-[32px] font-extrabold text-gold">{stat.n}</div>
                                <div className="lbl text-[11px] text-[#94A3B8] uppercase tracking-[1px] mt-1">{stat.l}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* FILTERS */}
                <div className="filters-section px-10 pt-8 max-w-[1400px] mx-auto">
                    <div className="filters-row flex gap-2.5 flex-wrap items-center mb-4">
                        <button
                            className={`filter-btn px-4.5 py-2 rounded-lg text-[13px] font-medium transition-all hover:bg-white/10 hover:text-white border ${getFilterStyle('all', activeFilter === 'all')}`}
                            onClick={() => setActiveFilter('all')}
                        >
                            All ({totalCount})
                        </button>

                        {(catalogData?.degree_catalog?.degree_types || [
                            { title: 'Bachelor' },
                            { title: 'Master' },
                            { title: 'Doctorate' }
                        ]).map((type: any) => {
                            const count = mappedDegrees.filter(d => d.level === type.title).length;
                            return (
                                <button
                                    key={type.title}
                                    className={`filter-btn px-4.5 py-2 rounded-lg text-[13px] font-medium transition-all hover:bg-white/10 hover:text-white border ${getFilterStyle(type.title, activeFilter === type.title)}`}
                                    onClick={() => setActiveFilter(type.title)}
                                >
                                    {type.title} ({count})
                                </button>
                            );
                        })}

                        <button
                            className={`filter-btn px-4.5 py-2 rounded-lg text-[13px] font-medium transition-all hover:bg-white/10 hover:text-white border ${getFilterStyle('Cert', activeFilter === 'Cert')}`}
                            onClick={() => setActiveFilter('Cert')}
                        >
                            Certifications ({CERTS.length})
                        </button>
                        <div className="search-box flex-1 min-w-[220px] max-w-[360px]">
                            <input
                                type="text"
                                placeholder="Search degrees or micro-credentials..."
                                className="w-full bg-white/6 border border-white/12 text-white px-4 py-2 rounded-lg text-[13px] outline-none focus:border-gold/50 placeholder:text-[#64748B]"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <div className="results-count px-10 pb-3 text-[13px] text-[#64748B] max-w-[1400px] mx-auto">
                    Showing {groups.reduce((acc, g) => acc + g.items.length, 0)} of {totalCount} credentials
                </div>

                {/* DEGREES GRID */}
                <div className="degrees-section px-10 pb-15 max-w-[1400px] mx-auto">
                    {groups.map(group => group.items.length > 0 && (
                        <div key={group.id} className="level-group mb-12">
                            <div className="level-header flex items-center gap-4 mb-5 pb-3 border-b border-white/8">
                                <span className={`level-badge text-[11px] font-bold tracking-[2px] uppercase px-3 py-1 rounded-[4px] ${group.id === 'Bachelor' ? 'bg-[#1E6B8C]/30 text-[#7EC8E3] border border-[#1E6B8C]/50' :
                                        group.id === 'Master' ? 'bg-gold/20 text-gold border border-gold/40' :
                                            group.id === 'Doctorate' ? 'bg-[#8a1a26]/20 text-[#FF8080] border border-[#8a1a26]/40' :
                                                'bg-[#9B59B6]/20 text-[#C39BD3] border border-[#9B59B6]/40'
                                    }`}>
                                    {group.id === 'Cert' ? 'Professional Certification' : group.id}
                                </span>
                                <span className="level-title text-[18px] font-bold text-white">{group.label}</span>
                                <span className="level-count ml-auto text-[13px] text-[#64748B]">{group.items.length} Programs</span>
                            </div>

                            <div className="degrees-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {group.items.map((deg: any) => (
                                    <div
                                        key={deg.id}
                                        className={`degree-card relative bg-white/3 border border-white/8 rounded-xl ${expandedDegrees.includes(deg.id) ? 'z-[60]' : 'z-10 overflow-hidden'} transition-all hover:bg-white/6 hover:border-white/20 hover:-translate-y-1 hover:shadow-[0_8px_32px_rgba(0,0,0,0.3)] border-l-3 ${group.id === 'Bachelor' ? 'border-l-[#1E6B8C]' :
                                                group.id === 'Master' ? 'border-l-[#a02030]' :
                                                    group.id === 'Doctorate' ? 'border-l-[#8a1a26]' :
                                                        'border-l-[#9B59B6]'
                                            } ${expandedDegrees.includes(deg.id) ? 'expanded' : ''}`}
                                    >
                                        <div className="card-header p-4 pb-3.5 flex items-start gap-3">
                                            <span className="card-num font-mono text-[11px] font-semibold text-[#64748B] bg-white/5 px-1.5 py-0.5 rounded-[4px]">
                                                {typeof deg.id === 'string' ? deg.id : String(deg.id).padStart(2, '0')}
                                            </span>
                                            <span className="card-name text-[13.5px] font-bold text-white leading-[1.4] flex-1">{deg.name}</span>
                                            {deg.partner && (
                                                <span className="card-partner text-[10px] font-bold text-[#C39BD3] bg-[#9B59B6]/15 border border-[#9B59B6]/30 px-1.5 py-0.5 rounded-[4px]">{deg.partner}</span>
                                            )}
                                        </div>
                                        <div className="card-meta px-4 pb-3.5 flex gap-4 flex-wrap">
                                            <div className="card-meta-item text-[11px] text-[#64748B]"><span className="text-[#94A3B8] font-semibold">{deg.mc_count}</span> MCs to Stack</div>
                                            <div className="card-meta-item text-[11px] text-[#64748B]"><span className="text-[#94A3B8] font-semibold">{deg.ects}</span> ECTS</div>
                                            <div className="card-meta-item text-[11px] text-[#64748B]">EQF <span className="text-[#94A3B8] font-semibold">{deg.eqf}</span></div>
                                            <div className="card-meta-item text-[11px] text-[#64748B]">Issued by <span className="text-[#94A3B8] font-semibold">EIU-Paris</span></div>
                                        </div>
                                        <div
                                            className="card-toggle p-2.5 px-4.5 border-t border-white/6 flex items-center justify-between text-[12px] text-gold font-bold cursor-pointer select-none hover:text-white transition-colors"
                                            onClick={() => toggleDegree(deg.id)}
                                        >
                                            <span>{expandedDegrees.includes(deg.id) ? 'Hide Micro-Credentials' : `View ${deg.mcs.length} Micro-Credentials`}</span>
                                            <svg className={`w-4 h-4 transition-transform duration-300 ${expandedDegrees.includes(deg.id) ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>
                                        </div>

                                        {expandedDegrees.includes(deg.id) && mounted && createPortal(
                                            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6">
                                                {/* Backdrop */}
                                                <div 
                                                    className="absolute inset-0 bg-[#040812]/90 backdrop-blur-md animate-in fade-in duration-300"
                                                    onClick={(e) => { e.stopPropagation(); toggleDegree(deg.id); }}
                                                ></div>
                                                
                                                {/* Modal Content */}
                                                <div className="relative w-full max-w-[560px] max-h-[90vh] bg-[#070c14] border border-white/15 rounded-[28px] shadow-[0_0_100px_rgba(196,136,14,0.15)] overflow-hidden animate-in zoom-in-95 fade-in duration-300 flex flex-col">
                                                    {/* Modal Header */}
                                                    <div className="p-6 sm:p-8 border-b border-white/10 bg-white/5 flex items-center justify-between">
                                                        <div className="flex flex-col">
                                                            <span className="text-[10px] uppercase tracking-[3px] font-bold text-gold mb-1">Micro-Credential Syllabus</span>
                                                            <h3 className="text-white font-serif font-bold text-xl sm:text-2xl leading-tight line-clamp-2">
                                                                {deg.name}
                                                            </h3>
                                                        </div>
                                                        <button 
                                                            onClick={(e) => { e.stopPropagation(); toggleDegree(deg.id); }}
                                                            className="text-white/30 hover:text-white transition-colors p-2"
                                                        >
                                                            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                                        </button>
                                                    </div>

                                                    {/* Modal Body - Scrollable */}
                                                    <div className="flex-1 overflow-y-auto p-6 sm:p-8 custom-scrollbar">
                                                        <div className="mb-6 flex items-center justify-between text-[11px] font-mono">
                                                            <span className="text-white/40 uppercase tracking-widest">Required Units ({deg.mcs.length})</span>
                                                            <span className="text-gold font-bold">{deg.ects} ECTS Total</span>
                                                        </div>
                                                        
                                                        <div className="space-y-3">
                                                            {deg.mcs.map((mc: string, idx: number) => (
                                                                <div key={idx} className="flex items-center gap-4 py-3.5 px-4 bg-white/[0.03] border border-white/5 rounded-2xl transition-all hover:bg-white/[0.06] hover:border-white/10 group">
                                                                    <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-bold font-mono text-white/30 group-hover:bg-gold group-hover:text-white group-hover:border-gold transition-all shrink-0">
                                                                        {String(idx + 1).padStart(2, '0')}
                                                                    </div>
                                                                    <div className={`w-1 h-4 rounded-full ${group.id === 'Bachelor' ? 'bg-[#1E6B8C]' :
                                                                            group.id === 'Master' ? 'bg-[#a02030]' :
                                                                                group.id === 'Doctorate' ? 'bg-[#8a1a26]' :
                                                                                    'bg-[#9B59B6]'
                                                                        } opacity-30 group-hover:opacity-100`}></div>
                                                                    <span className="text-[14px] text-white/80 group-hover:text-white leading-snug">{mc}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    {/* Modal Footer */}
                                                    <div className="p-6 border-t border-white/10 bg-white/3 flex justify-center">
                                                        <button 
                                                            onClick={(e) => { e.stopPropagation(); toggleDegree(deg.id); }}
                                                            className="text-[11px] uppercase tracking-[2px] font-bold text-white/40 hover:text-gold transition-colors"
                                                        >
                                                            Close Syllabus
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>,
                                            document.body
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
