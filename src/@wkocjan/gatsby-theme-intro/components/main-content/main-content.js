import React from "react"
import About from "../about/about"
import ContactForm from "../contact-form/contact-form"
import Projects from "../projects/projects"
import Publications from "../publications/publications"
import Skills from "../skills/skills"
import Summary from "../summary/summary"
import Tools from "../tools/tools"
import WorkHistoryList from "../work-history/work-history-list"

const MainContent = ({ formspreeEndpoint, history, projects, profile, publications }) => {
  return (
    <main className="lg:w-2/3 lg:pl-8 xl:pl-12">
      <Summary profile={profile} />

      <div className="flex flex-wrap">
        <div className="md:w-3/4 pb-4 md:pr-8 lg:pr-12 xl:pr-20">
          {/*profile.skills && <Skills skills={profile.skills} />*/}
          {profile.about && <About about={profile.about} />}
        </div>
        <div className="md:w-1/4 pb-4">
          {/*profile.tools && <Tools tools={profile.tools} />*/}
        </div>
      </div>

      {/*profile.about && <About about={profile.about} />*/}
      <Projects projects={projects} />
      <Publications 
        publications={publications}
        fullname={profile.fullname}
      />
      <WorkHistoryList historys={history} />
      <ContactForm
        formspreeEndpoint={formspreeEndpoint}
        budget={profile.budget}
      />
    </main>
  )
}

export default MainContent
