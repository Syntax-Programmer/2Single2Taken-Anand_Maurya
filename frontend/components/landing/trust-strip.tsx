import { Separator } from "@/components/ui/separator";

const points = [
  {
    label: "Built for the registry",
    detail: "Inputs mirror fields already on a cause list — no new data entry.",
  },
  {
    label: "Estimate, not verdict",
    detail: "Every output carries a confidence score and stays advisory.",
  },
  {
    label: "Designed to be audited",
    detail: "Plain figures and labels a bench can question and override.",
  },
];

export function TrustStrip() {
  return (
    <section id="about" className="border-y border-border bg-white py-20">
      <div className="container">
        <div className="grid gap-10 md:grid-cols-3">
          {points.map((p, i) => (
            <div key={p.label} className="flex gap-5">
              <span className="font-plex text-sm font-semibold text-gold-500">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <h4 className="font-plex text-[15px] font-semibold text-slate-900">
                  {p.label}
                </h4>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">
                  {p.detail}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="container mt-14">
        <Separator />
      </div>
    </section>
  );
}
