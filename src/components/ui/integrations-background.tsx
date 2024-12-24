"use client";

import { useRef } from "react";
import Image from "next/image";
import Logo from "@/components/logo";
import { Circle } from "./circle";
import { AnimatedBeam } from "./animated-beam";

export const IntegrationsBackground = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const div1Ref = useRef<HTMLDivElement>(null);
    const div2Ref = useRef<HTMLDivElement>(null);
    const div3Ref = useRef<HTMLDivElement>(null);
    const div4Ref = useRef<HTMLDivElement>(null);
    const div5Ref = useRef<HTMLDivElement>(null);
    const div6Ref = useRef<HTMLDivElement>(null);
    const div7Ref = useRef<HTMLDivElement>(null);

    return (
        <div className="absolute inset-0 flex items-center justify-end pr-12" ref={containerRef}>
            <div className="flex size-full flex-col max-w-[300px] max-h-[180px] items-stretch justify-between gap-6">
                <div className="flex flex-row items-center justify-between">
                    <Circle ref={div1Ref} className="hover:scale-110 transition-transform">
                        <Image src="/integrations/dexscreener.svg" alt="DexScreener" width={24} height={24} />
                    </Circle>
                    <Circle ref={div5Ref} className="hover:scale-110 transition-transform">
                        <Image src="/integrations/dialect.svg" alt="Dialect" width={24} height={24} />
                    </Circle>
                </div>
                <div className="flex flex-row items-center justify-between">
                    <Circle ref={div2Ref} className="hover:scale-110 transition-transform">
                        <Image src="/integrations/jupiter.svg" alt="Jupiter" width={24} height={24} />
                    </Circle>
                    <Circle ref={div4Ref} className="size-14 hover:scale-110 transition-transform">
                        <div className="size-8">
                            <Logo />
                        </div>
                    </Circle>
                    <Circle ref={div6Ref} className="hover:scale-110 transition-transform">
                        <Image src="/integrations/magic_eden.svg" alt="Magic Eden" width={24} height={24} />
                    </Circle>
                </div>
                <div className="flex flex-row items-center justify-between">
                    <Circle ref={div3Ref} className="hover:scale-110 transition-transform">
                        <Image src="/integrations/pump_fun.svg" alt="Pump Fun" width={24} height={24} />
                    </Circle>
                    <Circle ref={div7Ref} className="hover:scale-110 transition-transform">
                        <Image src="/integrations/defined_fi.svg" alt="Defined Fi" width={24} height={24} />
                    </Circle>
                </div>
            </div>

            <AnimatedBeam
                containerRef={containerRef}
                fromRef={div1Ref}
                toRef={div4Ref}
                curvature={-50}
                endYOffset={-8}
            />
            <AnimatedBeam
                containerRef={containerRef}
                fromRef={div2Ref}
                toRef={div4Ref}
            />
            <AnimatedBeam
                containerRef={containerRef}
                fromRef={div3Ref}
                toRef={div4Ref}
                curvature={50}
                endYOffset={8}
            />
            <AnimatedBeam
                containerRef={containerRef}
                fromRef={div5Ref}
                toRef={div4Ref}
                curvature={-50}
                endYOffset={-8}
                reverse
            />
            <AnimatedBeam
                containerRef={containerRef}
                fromRef={div6Ref}
                toRef={div4Ref}
                reverse
            />
            <AnimatedBeam
                containerRef={containerRef}
                fromRef={div7Ref}
                toRef={div4Ref}
                curvature={50}
                endYOffset={8}
                reverse
            />
        </div>
    );
}; 