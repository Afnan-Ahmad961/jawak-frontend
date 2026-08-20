import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { cn } from "@/lib/utils";
import { LOGIN_PATH } from "@/lib/config";

const STEPS = [
  {
    title: "Post a request",
    body: "Describe the apparel you need — specs, sizes, deadline, and design artwork.",
  },
  {
    title: "Compare bids",
    body: "Local manufacturers bid with price and timeline. Review ratings and portfolios, then award one.",
  },
  {
    title: "Track production",
    body: "Follow every stage from sourcing to delivery, message your vendor, and review the work.",
  },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-full flex-col">
      <header className="flex h-14 items-center justify-between px-4 md:px-8">
        <span className="text-sm font-semibold tracking-tight">Jawak</span>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <Link
            href={LOGIN_PATH}
            className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
          >
            Log in
          </Link>
        </div>
      </header>

      <main className="flex flex-1 flex-col">
        {/* Hero */}
        <section className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-4 py-20 text-center">
          <p className="text-muted-foreground mb-4 text-xs font-medium uppercase tracking-widest">
            Local clothing manufacturing, on demand
          </p>
          <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            Custom apparel, made by makers who bid for your work.
          </h1>
          <p className="text-muted-foreground mt-5 max-w-xl text-base text-pretty">
            Jawak is a bid-based marketplace connecting brands with local garment
            manufacturers. Post a request, compare real bids, and track
            production end to end.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
            <Link
              href={LOGIN_PATH}
              className={cn(buttonVariants({ size: "lg" }), "px-6")}
            >
              Get started
            </Link>
            <Link
              href="#how-it-works"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "px-6",
              )}
            >
              How it works
            </Link>
          </div>
        </section>

        {/* How it works */}
        <section
          id="how-it-works"
          className="border-t border-border bg-muted/30"
        >
          <div className="mx-auto grid w-full max-w-5xl gap-8 px-4 py-16 sm:grid-cols-3 md:px-8">
            {STEPS.map((step, i) => (
              <div key={step.title} className="space-y-3">
                <span className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-full text-sm font-semibold">
                  {i + 1}
                </span>
                <h2 className="text-base font-semibold tracking-tight">
                  {step.title}
                </h2>
                <p className="text-muted-foreground text-sm text-pretty">
                  {step.body}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-border px-4 py-6 md:px-8">
        <p className="text-muted-foreground text-xs">
          © {new Date().getFullYear()} Jawak. Upwork for garment production.
        </p>
      </footer>
    </div>
  );
}
