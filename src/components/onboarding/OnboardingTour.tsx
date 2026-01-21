'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useOnboardingStore } from '@/stores/onboarding-store';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { X, ChevronRight, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface TourStep {
    targetId: string;
    title: string;
    content: string;
    position?: 'top' | 'bottom' | 'left' | 'right';
}

interface OnboardingTourProps {
    steps: TourStep[];
}

export function OnboardingTour({ steps }: OnboardingTourProps) {
    const {
        isTourOpen,
        currentStep,
        setCurrentStep,
        setTourOpen,
        setHasSeenTour,
        hasSeenTour
    } = useOnboardingStore();

    const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

    // Initial check (optional: auto-start if not seen)
    useEffect(() => {
        if (!hasSeenTour) {
            setTourOpen(true);
        }
    }, [hasSeenTour, setTourOpen]);

    const updateTarget = useCallback(() => {
        if (!isTourOpen || currentStep >= steps.length) return;

        let activeIndex = currentStep;
        let element = document.getElementById(steps[activeIndex].targetId);

        // Find next valid step if current is missing
        let attempts = 0;
        const maxAttempts = steps.length; // Safety break

        while (!element && activeIndex < steps.length && attempts < maxAttempts) {
            console.log(`Skipping step ${activeIndex}: #${steps[activeIndex].targetId} not found`);
            activeIndex++;
            if (activeIndex < steps.length) {
                element = document.getElementById(steps[activeIndex].targetId);
            }
            attempts++;
        }

        if (activeIndex !== currentStep) {
            // We found a new valid step (or reached end)
            if (activeIndex >= steps.length) {
                // No more steps found
                setHasSeenTour(true);
                setTourOpen(false);
                setCurrentStep(0);
            } else {
                // Move to next valid step
                setCurrentStep(activeIndex);
            }
            return;
        }

        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setTargetRect(element.getBoundingClientRect());
        }
    }, [isTourOpen, currentStep, steps, setCurrentStep, setHasSeenTour, setTourOpen]);

    useEffect(() => {
        updateTarget();
        window.addEventListener('resize', updateTarget);
        window.addEventListener('scroll', updateTarget, true); // Capture scroll events

        return () => {
            window.removeEventListener('resize', updateTarget);
            window.removeEventListener('scroll', updateTarget, true);
        };
    }, [updateTarget]);

    // Re-calculate on step change
    useEffect(() => {
        // slight delay to allow layout shifts or scroll
        const timer = setTimeout(updateTarget, 100);
        return () => clearTimeout(timer);
    }, [currentStep, updateTarget]);


    if (!isTourOpen || currentStep >= steps.length || !targetRect) return null;

    const step = steps[currentStep];
    const isLastStep = currentStep === steps.length - 1;

    const handleNext = () => {
        if (isLastStep) {
            setHasSeenTour(true);
            setTourOpen(false);
            setCurrentStep(0);
        } else {
            setCurrentStep(currentStep + 1);
        }
    };

    const handlePrev = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleSkip = () => {
        setHasSeenTour(true);
        setTourOpen(false);
        setCurrentStep(0);
    };

    // Overlay Calculations
    // We create 4 localized overlays around the target rect
    const scrollTop = 0; // Fixed position handles viewport relative

    // Using fixed positioning for overlay
    const topOverlay = { top: 0, left: 0, right: 0, height: targetRect.top };
    const bottomOverlay = { top: targetRect.bottom, left: 0, right: 0, bottom: 0 };
    const leftOverlay = { top: targetRect.top, left: 0, width: targetRect.left, height: targetRect.height };
    const rightOverlay = { top: targetRect.top, left: targetRect.right, right: 0, height: targetRect.height };

    // Tooltip Position
    let tooltipStyle: React.CSSProperties = {};
    const margin = 12;

    switch (step.position || 'bottom') {
        case 'top':
            tooltipStyle = { top: targetRect.top - margin, left: targetRect.left + targetRect.width / 2, transform: 'translate(-50%, -100%)' };
            break;
        case 'bottom':
            tooltipStyle = { top: targetRect.bottom + margin, left: targetRect.left + targetRect.width / 2, transform: 'translate(-50%, 0)' };
            break;
        case 'left':
            tooltipStyle = { top: targetRect.top + targetRect.height / 2, left: targetRect.left - margin, transform: 'translate(-100%, -50%)' };
            break;
        case 'right':
            tooltipStyle = { top: targetRect.top + targetRect.height / 2, left: targetRect.right + margin, transform: 'translate(0, -50%)' };
            break;
    }

    // Safety check for tooltip off-screen could be added here

    return (
        <div className="fixed inset-0 z-[100] pointer-events-none">
            {/* Dimmed Overlay */}
            <div className="absolute bg-black/60 pointer-events-auto transition-all duration-300" style={topOverlay} />
            <div className="absolute bg-black/60 pointer-events-auto transition-all duration-300" style={bottomOverlay} />
            <div className="absolute bg-black/60 pointer-events-auto transition-all duration-300" style={leftOverlay} />
            <div className="absolute bg-black/60 pointer-events-auto transition-all duration-300" style={rightOverlay} />

            {/* Target Highlight Border */}
            <div
                className="absolute border-2 border-indigo-500 rounded-md shadow-[0_0_0_4px_rgba(99,102,241,0.2)] transition-all duration-300"
                style={{
                    top: targetRect.top,
                    left: targetRect.left,
                    width: targetRect.width,
                    height: targetRect.height,
                    pointerEvents: 'none' // Let clicks pass through if needed, but usually we block during tour
                }}
            />

            {/* Tooltip Card */}
            <Card className="absolute w-[350px] shadow-2xl animate-in zoom-in-95 pointer-events-auto" style={tooltipStyle}>
                <CardHeader className="pb-2 relative">
                    <CardTitle className="text-lg text-indigo-700">{step.title}</CardTitle>
                    <Button variant="ghost" size="icon" className="absolute right-2 top-2 h-6 w-6" onClick={handleSkip}>
                        <X className="h-4 w-4" />
                    </Button>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-slate-600 leading-relaxed">
                        {step.content}
                    </p>
                </CardContent>
                <CardFooter className="flex justify-between pt-2">
                    <div className="text-xs text-slate-400 flex items-center">
                        Step {currentStep + 1} of {steps.length}
                    </div>
                    <div className="flex gap-2">
                        {currentStep > 0 && (
                            <Button variant="outline" size="sm" onClick={handlePrev}>
                                <ChevronLeft className="h-4 w-4 mr-1" /> Back
                            </Button>
                        )}
                        <Button size="sm" onClick={handleNext} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                            {isLastStep ? 'Finish' : 'Next'} <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}
