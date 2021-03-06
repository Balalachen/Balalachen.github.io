import { graphql } from "gatsby"
import React from "react"
import CustomFonts from "../components/custom-fonts/custom-fonts"
import Footer from "../components/footer/footer"
import Header from "../components/header/header"
import MainContent from "../components/main-content/main-content"
import SEO from "../components/seo/seo"
import Sidebar from "../components/sidebar/sidebar"
import StructuredData from "../components/structured-data/structured-data"
import "../styles/style.css"

const IndexPage = ({ data }) => {
  const { history, profile, projects, site, social, publications } = data

  return (
    <div className="antialiased bg-back dark:bg-back-dark leading-normal font-text text-front transition-colors duration-500">
      <SEO />
        <StructuredData profile={profile} social={social.nodes} />
      <CustomFonts />

      <Header initials={profile.initials} />

      <div className="md:max-w-screen-sm lg:max-w-screen-xl mx-auto px-4 flex flex-wrap pt-4 my-8">
        
        <Sidebar profile={profile} social={social.nodes} history={history.nodes} />

        <MainContent
          history={history.nodes}
          profile={profile}
          projects={projects.nodes}
          publications={publications.nodes}
          formspreeEndpoint={site.siteMetadata.formspreeEndpoint}
        />
      </div>

      <Footer
        name={profile.name}
        showThemeLogo={site.siteMetadata.showThemeLogo}
      />
    </div>
  )
}

export default IndexPage

export const query = graphql`
  query {
    site {
      siteMetadata {
        showThemeLogo
        formspreeEndpoint
      }
    }
    profile: profileYaml {
      ...ProfileModFragment
    }
    social: allSocialYaml(filter: { url: { ne: null } }) {
      nodes {
        ...SocialFragment
      }
    }
    history: allWorkHistoryModYaml {
      nodes {
        ...WorkHistoryModFragment
      }
    }
    projects: allProjectsModYaml {
      nodes {
        ...ProjectModFragment
      }
    }
    publications: allPublicationsYaml {
      nodes {
        ...PublicationFragment
      }
    }
  }
`
