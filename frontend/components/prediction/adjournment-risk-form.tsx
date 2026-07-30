"use client";

import { useState } from "react";
import { ShieldAlert } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ResultCard } from "@/components/prediction/result-card";
import { RiskBadge } from "@/components/prediction/risk-badge";
import type { AdjournmentRiskInput, AdjournmentRiskResult, ComplexityLevel } from "@/types/prediction";

const initialInput: AdjournmentRiskInput = {
  previousAdjournments: "",
  counselPresence: "",
  witnessAvailability: "",
};

/**
 * Placeholder risk-scoring logic — presentational only.
 * Replace with a call to the adjournment-risk model endpoint.
 */
function mockPredict(input: AdjournmentRiskInput): AdjournmentRiskResult {
  let score = Number(input.previousAdjournments || 0) * 9;
  if (input.counselPresence === "One Absent") score += 22;
  if (input.counselPresence === "Both Absent") score += 45;
  if (input.witnessAvailability === "Partially Available") score += 12;
  if (input.witnessAvailability === "Unavailable") score += 28;

  const riskPercentage = Math.min(97, Math.max(4, Math.round(score)));
  const riskLevel: ComplexityLevel =
    riskPercentage >= 65 ? "High" : riskPercentage >= 35 ? "Medium" : "Low";

  return { riskPercentage, riskLevel };
}

export function AdjournmentRiskForm() {
  const [input, setInput] = useState<AdjournmentRiskInput>(initialInput);
  const [result, setResult] = useState<AdjournmentRiskResult | null>(null);

  const handlePredict = () => setResult(mockPredict(input));

  const isReady =
    input.previousAdjournments !== "" && input.counselPresence && input.witnessAvailability;

  return (
    <div className="grid gap-8 lg:grid-cols-5">
      <Card className="lg:col-span-3">
        <CardHeader>
          <div className="mb-1 flex items-center gap-2.5 text-judicial-500">
            <ShieldAlert className="h-4.5 w-4.5" strokeWidth={1.7} />
            <span className="text-xs font-semibold uppercase tracking-wide2">Module II</span>
          </div>
          <CardTitle>Adjournment Risk Prediction</CardTitle>
          <CardDescription>Estimate the probability of adjournment.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <Label htmlFor="ar-prev-adj">Previous adjournments</Label>
              <Input
                id="ar-prev-adj"
                type="number"
                min={0}
                placeholder="e.g. 2"
                value={input.previousAdjournments}
                onChange={(e) =>
                  setInput((s) => ({ ...s, previousAdjournments: e.target.value }))
                }
              />
            </div>

            <div>
              <Label htmlFor="ar-counsel">Counsel presence</Label>
              <Select
                value={input.counselPresence}
                onValueChange={(v) =>
                  setInput((s) => ({ ...s, counselPresence: v as AdjournmentRiskInput["counselPresence"] }))
                }
              >
                <SelectTrigger id="ar-counsel">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Both Present">Both Present</SelectItem>
                  <SelectItem value="One Absent">One Absent</SelectItem>
                  <SelectItem value="Both Absent">Both Absent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="sm:col-span-2">
              <Label htmlFor="ar-witness">Witness availability</Label>
              <Select
                value={input.witnessAvailability}
                onValueChange={(v) =>
                  setInput((s) => ({
                    ...s,
                    witnessAvailability: v as AdjournmentRiskInput["witnessAvailability"],
                  }))
                }
              >
                <SelectTrigger id="ar-witness">
                  <SelectValue placeholder="Select availability" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Available">Available</SelectItem>
                  <SelectItem value="Partially Available">Partially Available</SelectItem>
                  <SelectItem value="Unavailable">Unavailable</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button className="w-full sm:w-auto" disabled={!isReady} onClick={handlePredict}>
            Predict
          </Button>
        </CardContent>
      </Card>

      <div className="lg:col-span-2">
        <ResultCard
          visible={!!result}
          headlineLabel="Adjournment risk"
          headline={result ? `${result.riskPercentage}%` : ""}
          confidence={result?.riskPercentage ?? 0}
          meterLabel="Risk level"
          rightSlot={result ? <RiskBadge level={result.riskLevel} /> : undefined}
        />
        {!result && (
          <Card className="flex h-full min-h-[280px] flex-col items-center justify-center border-dashed p-8 text-center">
            <p className="text-sm text-slate-400">
              Fill in the case details and run a prediction to see the
              adjournment risk here.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
