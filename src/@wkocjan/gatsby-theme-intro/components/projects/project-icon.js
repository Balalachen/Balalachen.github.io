import React from "react"
import { Switch, Case, Default } from 'react-if';
import { FaCompass, FaGithub, FaYoutube, FaSteam, FaFacebook } from "react-icons/fa"
import { SiOculus, SiVivaldi, SiValve } from "react-icons/si"
import { string, ProjectModType } from "../../types"

const ProjectIcon = ({ url, idx }) => (  
  <span 
    className={"absolute right-0 top-0 mt-5 text-lead dark:text-lead-dark hover:opacity-50 transition-all duration-100"}
    style={{marginRight: 1.5 + idx * 2.5 + 'em'}}
  >
    <a 
      href={url}
      rel="noreferrer noopener"
      target="_blank"
    >
      <Switch>
        <Case condition={url.includes(".github")}>
          <FaGithub className="w-6 h-6" />
        </Case>
        <Case condition={url.includes(".youtube") || url.includes("youtu.be")}>
          <FaYoutube className="w-6 h-6" />
        </Case>
        <Case condition={url.includes(".facebook")}>
          <FaFacebook className="w-6 h-6" />
        </Case>
        <Case condition={url.includes("store.steam")}>
          <FaSteam className="w-6 h-6" />
        </Case>
        <Case condition={url.includes(".oculus")}>
          <SiOculus className="w-6 h-6" />
        </Case>
        <Case condition={url.includes(".viveport")}>
          <SiVivaldi className="w-6 h-6" />
        </Case>
        <Default>
          <FaCompass className="w-6 h-6" />
        </Default>
      </Switch>
    </a>
  </span>
)

ProjectIcon.propTypes = {
  url: string
}

export default ProjectIcon
