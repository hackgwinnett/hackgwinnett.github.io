import { HackathonFAQ } from "#/components/elements/ctas/HackathonFAQ.tsx";
import { NewsletterCTA } from "#/components/elements/ctas/NewsletterCTA.tsx";
import { Link } from "@tanstack/react-router";
import { Sponsors } from "./sponsors.tsx";
import { brand } from "#/lib/meta/brand";

export function HomepageMainContent() {
  return (
    <div className="bg-background p-6 sm:p-8 md:p-12 space-y-12">
      {/* Section 1 */}
      <section id="hg-info" className="grid lg:grid-cols-2 gap-10">
        <div className="space-y-4 text-base md:text-lg lg:text-xl leading-relaxed">
          <h2>Hack-a-What?!</h2>
          <p>
            {brand.name} is Metro Atlanta's premier high school computer science organization.{" "}
            {brand.name}'s signature event is its{" "}
            <Link to="/programs/hackathon" className="link">
              annual hackathon
            </Link>
            : free of cost, hosted at Gwinnett School of Mathematics, Science, and Technology, and
            open to middle and high school students across Georgia.
          </p>
          <p>
            During our flagship hackathon, students (solo or in groups up to four) gather to create
            innovative solutions to real-world problems within a short time constraint. Be on the
            lookout for {brand.name}'s fifth hackathon on October 25th to build awesome projects,
            participate in enriching workshops, and make new friends!
          </p>
        </div>
        <div className="space-y-4 flex flex-col lg:items-end">
          <h2 className="lg:text-end">
            Frequently Asked <span className="inline lg:hidden">Questions</span>
          </h2>
          <HackathonFAQ className="w-full lg:max-w-lg xl:max-w-xl" />
        </div>
      </section>

      {/* Section 2 */}
      <section id="sponsors">
        <Sponsors
          title={<h2>Our Sponsors</h2>}
          footer={
            <span className="text-muted-foreground/50">
              Support us in our mission to empower developers by{" "}
              <Link to="/sponsors" className="primary-link">
                sponsoring HackGwinnett
              </Link>
            </span>
          }
        />
      </section>

      {/* Section 3 */}
      <section id="newslettercta" className="p-6 bg-accent">
        <NewsletterCTA button="Sign me up!" />
      </section>
    </div>
  );
}
