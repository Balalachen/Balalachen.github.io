import React, {useState} from "react"
import Project from "./project"
import { arrayOf, shape, ProjectModType } from "../../types"
import { Masonry } from 'masonic'


const Projects = ({ projects }) => {
  const [isCollapse, setIsCollapse] = useState(true)
  
  let subProjects = [];
  for( let i=0 ; i<projects.length ; i++ ){
    if( !isCollapse || projects[i].selection ){
      subProjects.push(projects[i]);
    }
  }

  const MasonryCard = ({index, data, width}) => (
    <Project key={`${"proj"}_${data.name}`} {...data} isCollapse={isCollapse} />
  )

  return (
    <>
      <div className="flex flex-row text-front dark:text-front-dark transition-colors duration-500">
        <h5 className="font-header font-semibold text-sm uppercase mb-3" id="projects">
          Projects
        </h5>
        <button 
          className="font-header font-semibold underline opacity-50 text-sm uppercase mb-3 ml-2 hover:opacity-25 transition-opacity duration-100"
          style={{
            visibility: !isCollapse ? "visible" : "hidden",
          }}
          type="button"
          name="cp_projects1"
          id="cp_projects1"
          onClick={() => setIsCollapse(!isCollapse)}
        >( - Fold)</button>
      </div>

      <Masonry 
        key={ isCollapse ? 'Selections' : 'FullProjects' }
        items={subProjects} 
        columnWidth={300}
        render={MasonryCard} 
      />
      
      {/*
      <div className="grid grid-cols-2 gap-5">
      {projects.map((project, i) => (
        <Project key={`${"proj"}_${i}`} {...project} isCollapse={isCollapse} />
      ))}
      </div>*/}

      <div className="flex flex-row text-front dark:text-front-dark transition-colors duration-500">
        <button 
          className="font-header font-semibold underline opacity-50 text-sm uppercase mb-3 ml-auto hover:opacity-25 transition-opacity duration-100"
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
