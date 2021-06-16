import { GatsbyImage } from "gatsby-plugin-image"
import React, {useRef} from "react"
import { GiLaurelsTrophy, GiLaurels } from "react-icons/gi"
import { BsPeopleCircle } from "react-icons/bs"
import { ProjectModType } from "../../types"
import ProjectIcon from "./project-icon"
import ProjectStatus from "./project-status"
import ProjectTags from "./project-tags"

function AwardLineHandler({awardLine}){
  let longAward = awardLine.split(' | ');

  return (
    <span className="flex-1 flex-wrap pl-2 text-xs">
      {longAward.map(award => (
        <span key={award} className="inline-block pr-1">{award}</span>
      ))}
    </span>
  )
}

const Project = props => {
  const { name, image, url, description, selection, status, position, tags, awards, exhibitions, isCollapse } = props
  const projDetails = useRef(null)

  return (
    <div
      className={`${"overflow-hidden transition-all duration-150 ease-linear "}${(!isCollapse || selection ? "mb-3 " : "")}`}
      style={{
        height: !isCollapse || selection ? projDetails.current?.clientHeight : 0,
        opacity: !isCollapse || selection ? 100 : 0.3,
      }}
    >
    <div 
      className="border-t-4 border-line relative flex flex-wrap bg-back-light p-4 lg:p-8 bg-no-repeat text-sm"
      ref={projDetails}
    >
      {image && (
        <div className="w-full pb-4 lg:w-2/5 lg:pr-6 lg:pb-0">
          <GatsbyImage image={image.childImageSharp.gatsbyImageData} alt={name} />
          <ul className="pr-2 mt-2 ml-auto">
            {status && <ProjectStatus status={status} />}
            {tags && <ProjectTags tags={tags} />}
          </ul>
        </div>
      )}
      <div className="lg:flex-1" >
        <h4 className="font-bold">{name}</h4>
        {position && (
          <p className="w-full font-light py-0 opacity-50">{position}</p>
        )}
        <p className="w-full py-2 whitespace-pre-line text-justify">{description}</p>
        {/*position && (
          <div className="inline-block flex flex-row font-medium text-xs mt-1 mb-1">
            <BsPeopleCircle className="inline-block w-4 h-4" />
            <p className="flex-1 font-medium pl-2">{position}</p>
          </div>
        )*/}
        <div className={"flex flex-row "+((image == null)?"":"lg:flex-col")+" justify-between"}>
        {awards &&(
          <ul className={"pr-2 flex flex-col w-1/2" + ((image == null) ? "" : "lg:w-full") }>
            {awards.map(awardLine =>(
              <li 
                className="inline-block flex flex-row font-medium mt-1"
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
          <ul className={"pr-2 flex flex-col lg:mt-2 w-1/2" + ((image == null) ? "" : "lg:w-full") }>
            {exhibitions.map(exhib =>(
              <li 
                className="flex flex-row font-medium mt-1 ml-0"
                key={exhib}
              >
                <span className="w-2 h-2 ml-0 lg:ml-1 mt-1 bg-line rounded-full"></span>
                <span className="flex-1 pl-3 text-xs">{exhib}</span>
              </li>
            ))}
          </ul>
        )}
        </div>
        
        {image == null && (
          <ul className="pr-2 mt-2 ml-auto">
            {status && <ProjectStatus status={status} />}
            {tags && <ProjectTags tags={tags} />}
          </ul>
        )}
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
