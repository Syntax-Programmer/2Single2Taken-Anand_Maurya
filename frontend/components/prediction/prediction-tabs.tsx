"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { HearingDurationForm } from "@/components/prediction/hearing-duration-form";
import { AdjournmentRiskForm } from "@/components/prediction/adjournment-risk-form";
import { CaseComplexityForm } from "@/components/prediction/case-complexity-form";

export function PredictionTabs() {
  return (
    <Tabs defaultValue="duration" className="w-full">
      <TabsList>
        <TabsTrigger value="duration">Hearing Duration</TabsTrigger>
        <TabsTrigger value="adjournment">Adjournment Risk</TabsTrigger>
        <TabsTrigger value="complexity">Case Complexity</TabsTrigger>
      </TabsList>

      <TabsContent value="duration">
        <HearingDurationForm />
      </TabsContent>
      <TabsContent value="adjournment">
        <AdjournmentRiskForm />
      </TabsContent>
      <TabsContent value="complexity">
        <CaseComplexityForm />
      </TabsContent>
    </Tabs>
  );
}
