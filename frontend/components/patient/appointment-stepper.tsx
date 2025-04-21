"use client"

import { cn } from "@/lib/utils"

interface AppointmentStepperProps {
  currentStep: number
  steps: { title: string; description: string }[]
}

export function AppointmentStepper({ currentStep, steps }: AppointmentStepperProps) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={index} className="flex flex-col items-center">
            <div className="flex items-center">
              {index > 0 && (
                <div
                  className={cn(
                    "h-1 w-12 sm:w-24 md:w-32",
                    index <= currentStep
                      ? "bg-primary"
                      : "bg-muted"
                  )}
                />
              )}
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-medium",
                  index < currentStep
                    ? "border-primary bg-primary text-primary-foreground"
                    : index === currentStep
                    ? "border-primary text-primary"
                    : "border-muted text-muted-foreground"
                )}
              >
                {index < currentStep ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-check"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  index + 1
                )}
              </div>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "h-1 w-12 sm:w-24 md:w-32",
                    index < currentStep
                      ? "bg-primary"
                      : "bg-muted"
                  )}
                />
              )}
            </div>
            <div className="mt-2 text-center">
              <div
                className={cn(
                  "text-xs font-medium",
                  index <= currentStep
                    ? "text-primary"
                    : "text-muted-foreground"
                )}
              >
                {step.title}
              </div>
              <div className="text-xs text-muted-foreground hidden sm:block">
                {step.description}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
