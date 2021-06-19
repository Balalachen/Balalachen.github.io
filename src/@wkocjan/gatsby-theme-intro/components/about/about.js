import React from "react"
import { ProfileType } from "../../types"

const About = ({ about }) => (
  <>
    <h5 className="font-header font-semibold text-front dark:text-front-dark text-sm uppercase mb-3 transition-colors duration-500">
      About
    </h5>
    <div className="font-text text-sm dark:text-front-dark pb-12 leading-normal whitespace-pre-line transition-colors duration-500">
      {about}
    </div>
  </>
)

About.propTypes = {
  about: ProfileType.about,
}

export default About
