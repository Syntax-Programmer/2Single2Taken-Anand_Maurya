"use client";

import { useState } from "react";
import { LayoutGrid } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ResultCard } from "@/components/prediction/result-card";
import { RiskBadge } from "@/components/prediction/risk-badge";
import type { CaseComplexityInput, CaseComplexityResult, CaseType, ComplexityLevel } from "@/types/prediction";

const CASE_TYPES: CaseType[] = [
  "Civil",
  "Criminal",
  "Family",
  "Commercial",
  "Constitutional",
  "Writ Petition",
];

const initialInput: CaseComplexityInput = {
  caseType: "",
  numberOfParties: "",
  documentCount: "",
  previousHearings: "",
};

/**
 * Placeholder classification logic — presentational only.
 * Replace with a call to the case-complexity model endpoint.
 */
function mockPredict(input: CaseComplexityInput): CaseComplexityResult {
  let score = 0;
  score += Number(input.numberOfParties || 0) * 6;
  score += Number(input.documentCount || 0) * 0.4;
  score += Number(input.previousHearings || 0) * 3;
  if (input.caseType === "Constitutional") score += 25;
  if (input.caseType === "Commercial") score += 15;

  const level: ComplexityLevel = score >= 70 ? "High" : score >= 35 ? "Medium" : "Low";
  const confidence = Math.min(95, 60 + Math.round(score / 4));

  return { level, confidence };
}

export function CaseComplexityForm() {
  const [input, setInput] = useState<CaseComplexityInput>(initialInput);
  const [result, setResult] = useState<CaseComplexityResult | null>(null);

  const handleClassify = () => setResult(mockPredict(input));

  const isReady =
    input.caseType && input.numberOfParties && input.documentCount && input.previousHearings;

  return (
    <div className="grid gap-8 lg:grid-cols-5">
      <Card className="lg:col-span-3">
        <CardHeader>
          <div className="mb-1 flex items-center gap-2.5 text-judicial-500">
            <LayoutGrid className="h-4.5 w-4.5" strokeWidth={1.7} />
            <span className="text-xs font-semibold uppercase tracking-wide2">Module III</span>
          </div>
          <CardTitle>Case Complexity Classification</CardTitle>
          <CardDescription>
            Classify cases into Low, Medium and High complexity.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <Label htmlFor="cc-case-type">Case type</Label>
              <Select
                value={input.caseType}
                onValueChange={(v) => setInput((s) => ({ ...s, caseType: v as CaseType }))}
              >
                <SelectTrigger id="cc-case-type">
                  <SelectValue placeholder="Select case type" />
                </SelectTrigger>
                <SelectContent>
                  {CASE_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="cc-parties">Number of parties</Label>
              <Input
                id="cc-parties"
                type="number"
                min={0}
                placeholder="e.g. 4"
                value={input.numberOfParties}
                onChange={(e) => setInput((s) => ({ ...s, numberOfParties: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="cc-docs">Document count</Label>
              <Input
                id="cc-docs"
                type="number"
                min={0}
                placeholder="e.g. 60"
                value={input.documentCount}
                onChange={(e) => setInput((s) => ({ ...s, documentCount: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="cc-prev-hearings">Previous hearings</Label>
              <Input
                id="cc-prev-hearings"
                type="number"
                min={0}
                placeholder="e.g. 5"
                value={input.previousHearings}
                onChange={(e) => setInput((s) => ({ ...s, previousHearings: e.target.value }))}
              />
            </div>
          </div>

          <Button className="w-full sm:w-auto" disabled={!isReady} onClick={handleClassify}>
            Classify
          </Button>
        </CardContent>
      </Card>

      <div className="lg:col-span-2">
        <ResultCard
          visible={!!result}
          headlineLabel="Complexity classification"
          headline={result ? result.level : ""}
          confidence={result?.confidence ?? 0}
          rightSlot={result ? <RiskBadge level={result.level} /> : undefined}
        />
        {!result && (
          <Card className="flex h-full min-h-[280px] flex-col items-center justify-center border-dashed p-8 text-center">
            <p className="text-sm text-slate-400">
              Fill in the case details and classify to see the complexity level
              here.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
