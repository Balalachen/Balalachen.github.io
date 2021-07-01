import React from "react"
import { ProjectModType } from "../../types"

const ProjectStatus = ({ status }) => (
  <li className="inline-block px-3 py-0.5 mr-1 mt-1 font-light text-xs rounded-lg border border-back dark:border-front-dark dark:text-front-dark transition-colors duration-500">
    <span
      className={`inline-block w-2 h-2 rounded-full mr-2 ${
        status.toLowerCase() === "live" ? "bg-green-600" : 
        status.toLowerCase() === "published" ? "bg-blue-400" : "bg-red-300"
      }`}
    ></span>
    {status}
  </li>
)

ProjectStatus.propTypes = {
  status: ProjectModType.status,
}

export default ProjectStatus
