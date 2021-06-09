import React from "react"
import { FaCompass, FaGithub, FaYoutube, FaSteam } from "react-icons/fa"
import { string, ProjectModType } from "../../types"

const ProjectIcon = ({ icon, url, idx }) => (  
  <span 
    className={"absolute right-0 top-0 mt-5 text-lead hover:opacity-50 transition-opacity duration-100"}
    style={{marginRight: 1.5 + idx * 2.5 + 'em'}}
  >
    <a 
      href={url}
      rel="noreferrer noopener"
      target="_blank"
    >
    {icon === "github" ? (
      <FaGithub className="w-6 h-6" />
    ) : icon === "youtube" ? (
      <FaYoutube className="w-6 h-6" />
    ) : icon === "steam" ? (
      <FaSteam className="w-6 h-6" />
    ) : (
      <FaCompass className="w-6 h-6" />
    )}
    </a>
  </span>
)

ProjectIcon.propTypes = {
  icon: string
}

export default ProjectIcon
