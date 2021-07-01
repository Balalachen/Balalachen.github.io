import React from "react"
import { ProjectModType } from "../../types"

const ProjectTags = ({ tags }) => (
  <>
    {tags.map(tag => (
      <li
        className="inline-block px-3 py-0.5 mr-1 mt-1 font-light text-xs rounded-lg bg-back dark:bg-back-dark dark:text-front-dark opacity-75 transition-colors duration-500"
        key={tag}
      >
        {tag}
      </li>
    ))}
  </>
)

ProjectTags.propTypes = {
  tags: ProjectModType.tags,
}

export default ProjectTags
