import { GatsbyImage } from "gatsby-plugin-image"
import React from "react"
import { GiLaurelsTrophy, GiLaurels } from "react-icons/gi"
import { BsPeopleCircle } from "react-icons/bs"
import { ProjectModType } from "../../types"
import ProjectIcon from "./project-icon"
import ProjectStatus from "./project-status"
import ProjectTags from "./project-tags"

function AwardLineHandler({awardLine}){
  let longAward = awardLine.split(' | ');

  return (
    <span className="flex-1 flex-wrap pl-2 text-xs font-light">
      {longAward.map(award => (
        <span key={award} className="inline-block pr-1">{award}</span>
      ))}
    </span>
  )
}

const Project = props => {
  const { name, image, url, description, selection, status, position, tags, awards, exhibitions, isCollapse } = props

  return (
    <div
      className={`${"rounded mr-1 lg:mr-3 mb-3 overflow-hidden shadow-md dark:text-front-dark transition-all duration-150 ease-linear "}`}
      style={{
        opacity: !isCollapse || selection ? 100 : 0.3,
      }}
    >
    <div className="relative flex flex-wrap bg-back-light dark:bg-back-light-dark bg-no-repeat text-sm">
      {image && (
        <div className="w-full">
          <GatsbyImage image={image.childImageSharp.gatsbyImageData} alt={name} />
        </div>
      )}
      <div className="px-4 pt-4 lg:px-8 lg:pt-6" >
        <h4 className="font-bold">{name}</h4>
        {position && (
          <p className="w-full font-light py-0 opacity-50">{position}</p>
        )}
        <p className="w-full py-2 mb-2 whitespace-pre-line text-justify">{description}</p>
        {/*position && (
          <div className="inline-block flex flex-row font-medium text-xs mt-1 mb-1">
            <BsPeopleCircle className="inline-block w-4 h-4" />
            <p className="flex-1 font-medium pl-2">{position}</p>
          </div>
        )*/}
        {awards &&(
          <ul className={"pr-2 py-1 flex flex-col lg:w-full border-t border-line dark:border-line-dark" }>
            {awards.map(awardLine =>(
              <li 
                className="inline-block flex flex-row font-medium my-1"
                key={awardLine}
              >
                {awardLine.includes("[a] ") ? 
                  <GiLaurelsTrophy className="inline-block w-4 h-4" /> :
                  <GiLaurels className="inline-block w-4 h-4" />}
                <AwardLineHandler awardLine={awardLine.replace("[a] ", "")} />
              </li>
            ))}
          </ul>
        )}
        {exhibitions &&(
          <ul className={"pr-2 py-1 flex flex-col lg:w-full border-t border-line dark:border-line-dark" }>
            {exhibitions.map(exhib =>(
              <li 
                className="flex flex-row font-medium mt-1 ml-0"
                key={exhib}
              >
                <span className="w-2 h-2 ml-0 lg:ml-1 mt-1 bg-line rounded-full"></span>
                <span className="flex-1 pl-3 text-xs font-light">{exhib}</span>
              </li>
            ))}
          </ul>
        )}
        
        <ul className="pt-1 my-2 lg:mb-4">
          {status && <ProjectStatus status={status} />}
          {tags && <ProjectTags tags={tags} />}
        </ul>

        {url && url.map((theURL, i) => (
          <ProjectIcon key={`${name}_${"picon"}_${i}`} url={theURL} idx={i} />
        ))}
        
      </div>
    </div>
    </div>
  )
}

Project.propTypes = ProjectModType

export default Project
