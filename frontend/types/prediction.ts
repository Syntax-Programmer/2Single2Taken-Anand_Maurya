export type CaseType =
  | "Civil"
  | "Criminal"
  | "Family"
  | "Commercial"
  | "Constitutional"
  | "Writ Petition";

export type ComplexityLevel = "Low" | "Medium" | "High";

export interface HearingDurationInput {
  caseType: CaseType | "";
  judge: string;
  previousHearings: string;
  documentCount: string;
}

export interface HearingDurationResult {
  estimatedMinutes: number;
  confidence: number; // 0-100
}

export interface AdjournmentRiskInput {
  previousAdjournments: string;
  counselPresence: "Both Present" | "One Absent" | "Both Absent" | "";
  witnessAvailability: "Available" | "Partially Available" | "Unavailable" | "";
}

export interface AdjournmentRiskResult {
  riskPercentage: number;
  riskLevel: ComplexityLevel;
}

export interface CaseComplexityInput {
  caseType: CaseType | "";
  numberOfParties: string;
  documentCount: string;
  previousHearings: string;
}

export interface CaseComplexityResult {
  level: ComplexityLevel;
  confidence: number;
}
