import HeroSection from '../components/sections/HeroSection'
import PositioningSection from '../components/sections/PositioningSection'
import ProblemsWeSolveSection from '../components/sections/ProblemsWeSolveSection'
import WhatWeBuildSection from '../components/sections/WhatWeBuildSection'
import SelectedWorkSection from '../components/sections/SelectedWorkSection'
import HowWeWorkSection from '../components/sections/HowWeWorkSection'
import PeopleAskSection from '../components/sections/PeopleAskSection'
import LetsTalkSection from '../components/sections/LetsTalkSection'
import Reveal from '../components/motion/Reveal'
import { usePageTitle } from '../lib/usePageTitle'
import { homePeopleAsk } from '../config/peopleAsk'

/**
 * Agency IA (design-os/prompts/agency_website.md + UX-GATE §15.3.2):
 * Hero → Positioning → Problems → Services → Portfolio → Process → FAQ → Contact
 * Wave 9 Phase B: calm spatial rhythm; one primary focus per section.
 */
export default function HomePage() {
  usePageTitle()

  return (
    <>
      <HeroSection />

      <Reveal>
        <PositioningSection />
      </Reveal>

      <Reveal>
        <ProblemsWeSolveSection />
      </Reveal>

      <Reveal>
        <WhatWeBuildSection />
      </Reveal>

      <Reveal>
        <SelectedWorkSection />
      </Reveal>

      <Reveal>
        <HowWeWorkSection />
      </Reveal>

      <Reveal>
        <PeopleAskSection
          items={homePeopleAsk}
          intro="The questions buyers ask before they write. Expand any — or skip ahead and start a project."
        />
      </Reveal>

      <LetsTalkSection />
    </>
  )
}
