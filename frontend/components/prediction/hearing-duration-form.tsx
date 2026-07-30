"use client";

import { useState } from "react";
import { Gavel } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ResultCard } from "@/components/prediction/result-card";
import type { CaseType, HearingDurationInput, HearingDurationResult } from "@/types/prediction";

const CASE_TYPES: CaseType[] = [
  "Civil",
  "Criminal",
  "Family",
  "Commercial",
  "Constitutional",
  "Writ Petition",
];

const initialInput: HearingDurationInput = {
  caseType: "",
  judge: "",
  previousHearings: "",
  documentCount: "",
};

/**
 * Placeholder estimation logic — presentational only.
 * Replace with a call to the hearing-duration model endpoint.
 */
function mockPredict(input: HearingDurationInput): HearingDurationResult {
  const base = 25;
  const docLoad = Number(input.documentCount || 0) * 0.6;
  const history = Number(input.previousHearings || 0) * 3.2;
  const typeWeight = input.caseType === "Constitutional" ? 30 : input.caseType === "Commercial" ? 18 : 8;
  const estimatedMinutes = Math.round(base + docLoad + history + typeWeight);
  const confidence = Math.min(96, 62 + Math.round(Number(input.previousHearings || 0) * 2.5));
  return { estimatedMinutes, confidence };
}

export function HearingDurationForm() {
  const [input, setInput] = useState<HearingDurationInput>(initialInput);
  const [result, setResult] = useState<HearingDurationResult | null>(null);

  const handlePredict = () => setResult(mockPredict(input));

  const isReady = input.caseType && input.judge && input.previousHearings && input.documentCount;

  return (
    <div className="grid gap-8 lg:grid-cols-5">
      <Card className="lg:col-span-3">
        <CardHeader>
          <div className="mb-1 flex items-center gap-2.5 text-judicial-500">
            <Gavel className="h-4.5 w-4.5" strokeWidth={1.7} />
            <span className="text-xs font-semibold uppercase tracking-wide2">Module I</span>
          </div>
          <CardTitle>Hearing Duration Prediction</CardTitle>
          <CardDescription>Estimate how long a hearing may take.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <Label htmlFor="hd-case-type">Case type</Label>
              <Select
                value={input.caseType}
                onValueChange={(v) => setInput((s) => ({ ...s, caseType: v as CaseType }))}
              >
                <SelectTrigger id="hd-case-type">
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
              <Label htmlFor="hd-judge">Judge</Label>
              <Input
                id="hd-judge"
                placeholder="e.g. Justice A. Sharma"
                value={input.judge}
                onChange={(e) => setInput((s) => ({ ...s, judge: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="hd-prev-hearings">Previous hearings</Label>
              <Input
                id="hd-prev-hearings"
                type="number"
                min={0}
                placeholder="e.g. 3"
                value={input.previousHearings}
                onChange={(e) => setInput((s) => ({ ...s, previousHearings: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="hd-doc-count">Document count</Label>
              <Input
                id="hd-doc-count"
                type="number"
                min={0}
                placeholder="e.g. 45"
                value={input.documentCount}
                onChange={(e) => setInput((s) => ({ ...s, documentCount: e.target.value }))}
              />
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
          headlineLabel="Estimated duration"
          headline={result ? `${result.estimatedMinutes} min` : ""}
          confidence={result?.confidence ?? 0}
        />
        {!result && (
          <Card className="flex h-full min-h-[280px] flex-col items-center justify-center border-dashed p-8 text-center">
            <p className="text-sm text-slate-400">
              Fill in the case details and run a prediction to see the estimated
              hearing duration here.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
