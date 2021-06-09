import React from "react"
import { If, Then, Else, When, Unless, Switch, Case, Default } from 'react-if';
import { SiUnity, SiCsharp, SiCplusplus } from "react-icons/si"
import { ProjectModType } from "../../types"

const ProjectTags = ({ tags }) => (
  <>
    {tags.map(tag => (
      <li
        className="inline-block px-3 py-1 mr-1 mt-1 font-medium text-xs rounded-lg border border-back"
        key={tag}
      >
        <Switch>
          <Case condition={tag.toLowerCase().includes("unity")}>
            <SiUnity className="inline-block w-4 h-4 mr-2" />
            {/* tag.toLowerCase().replace("unity", "").toUpperCase() */}
          </Case>
          <Case condition={tag.toLowerCase().includes("csharp")}>
            <SiCsharp className="inline-block w-4 h-4 mr-2" />
            {/* tag.toLowerCase().replace("csharp", "").toUpperCase() */}
          </Case>
          <Case condition={tag.toLowerCase().includes("cplusplus")}>
            <SiCplusplus className="inline-block w-4 h-4 mr-2" />
            {/* tag.toLowerCase().replace("cplusplus", "").toUpperCase() */}
          </Case>
          <Default>
            {/* tag*/}
          </Default>
        </Switch>
        {tag}
      </li>
    ))}
  </>
)

ProjectTags.propTypes = {
  tags: ProjectModType.tags,
}

export default ProjectTags
