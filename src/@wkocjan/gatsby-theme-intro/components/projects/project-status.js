import React from "react"
import { ProjectModType } from "../../types"

const ProjectStatus = ({ status }) => (
  <li className="inline-block px-3 py-1 mr-1 mt-1 font-medium text-xs rounded-lg border border-back dark:border-back-dark dark:text-front-dark transition-colors duration-500">
    <span
      className={`inline-block w-2 h-2 rounded-full mr-2 ${
        status.toLowerCase() === "live" ? "bg-green-500" : 
        status.toLowerCase() === "published" ? "bg-blue-500" : "bg-orange-500"
      }`}
    ></span>
    Status: {status}
  </li>
)

ProjectStatus.propTypes = {
  status: ProjectModType.status,
}

export default ProjectStatus
