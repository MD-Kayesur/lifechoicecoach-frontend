"use client";

import { Hero } from "@/components/landingPages/Hero";
import { TrustBar } from "@/components/landingPages/TrustBar";
import { Features } from "@/app/catalog/Features";
import { HowItWorks } from "@/components/landingPages/HowItWorks";
import { MicroCredential } from "@/components/landingPages/MicroCredential";
import { IkonPassport } from "@/components/landingPages/IkonPassport";
import { CredentialDomains } from "@/components/landingPages/CredentialDomains";
import { IkonSteps } from "@/components/landingPages/IkonSteps";
import { QualityAssurance } from "@/components/landingPages/QualityAssurance";
import { EQFLevels } from "@/components/degrees/EQFLevels";

export default function LandingPage() {
    return (
        <main className="min-h-screen bg-background">
            <Hero />
            <TrustBar />
            <MicroCredential />
            <IkonPassport />
            <CredentialDomains />
            <IkonSteps />
            <QualityAssurance />
            {/* <div className="max-w-[1400px] mx-auto px-10 py-24">
                <EQFLevels />
            </div> */}
            {/* <Features /> */}
            {/* <HowItWorks /> */}
        </main>
    );
}
