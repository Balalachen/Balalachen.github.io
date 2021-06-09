import React, {useState} from "react"
import Project from "./project"
import { arrayOf, shape, ProjectModType } from "../../types"

const Projects = ({ projects }) => {
  const [isCollapse, setIsCollapse] = useState(true)

  return (
    <>
      <div className="flex flex-row">
        <h5 className="font-header font-semibold text-front text-sm uppercase mb-3" id="projects">
          Projects
        </h5>
        <button 
          className="font-header font-semibold underline text-front opacity-50 text-sm uppercase mb-3 ml-2 hover:opacity-25 transition-opacity duration-100"
          style={{
            visibility: !isCollapse ? "visible" : "hidden",
          }}
          type="button"
          name="cp_projects1"
          id="cp_projects1"
          onClick={() => setIsCollapse(!isCollapse)}
        >( - Fold)</button>
      </div>
      
      {projects.map((project, i) => (
        <Project key={`${"proj"}_${i}`} {...project} isCollapse={isCollapse} />
      ))}

      <div className="flex flex-row">
        <button 
          className="font-header font-semibold underline text-front opacity-50 text-sm uppercase mb-3 ml-auto hover:opacity-25 transition-opacity duration-100"
          type="button"
          name="cp_projects2"
          id="cp_projects2"
          onClick={() => setIsCollapse(!isCollapse)}
        >
          {isCollapse ?
            "... See Complete Project List ("+projects.length+")" :
            "Fold Some Projects"
          }
        </button>
      </div>
    </>
  )
}

Projects.propTypes = {
  projects: arrayOf(shape(ProjectModType)),
}

export default Projects
