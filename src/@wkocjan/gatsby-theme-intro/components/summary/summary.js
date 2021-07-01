import React from "react"
import { FaCompass } from "react-icons/fa"
import { Switch, Case, Default } from 'react-if';
import { SiOpengl, SiUnity, SiCsharp, SiCplusplus, SiPython, SiVisualstudiocode, SiAutodesk, SiArduino } from "react-icons/si"
import { shape, ProfileType } from "../../types"

function WordParser ({word, colorset}){
  return (
    <Switch>
      <Case condition={word.toLowerCase().includes("glsl") || word.toLowerCase().includes("opengl")}>
        <SiOpengl className={`"inline-block w-10 h-10 mr-2 opacity-75 transition-opacity duration-150 ${colorset} dark:${colorset}-dark"`} />
      </Case>
      <Case condition={word.toLowerCase().includes("c#")}>
        <SiCsharp className={`"inline-block my-3 w-4 h-4 mr-2 opacity-75 transition-opacity duration-150 ${colorset} dark:${colorset}-dark"`} />
      </Case>
      <Case condition={word.toLowerCase().includes("c++")}>
        <SiCplusplus className={`"inline-block my-3 w-4 h-4 mr-2 opacity-75 transition-opacity duration-150 ${colorset} dark:${colorset}-dark"`} />
      </Case>
       <Case condition={word.toLowerCase().includes("python")}>
        <SiPython className={`"inline-block my-3 w-4 h-4 mr-2 opacity-75 transition-opacity duration-150 ${colorset} dark:${colorset}-dark"`} />
      </Case>
      <Case condition={word.toLowerCase().includes("unity")}>
        <SiUnity className={`"inline-block my-3 w-4 h-4 mr-2 opacity-75 transition-opacity duration-150 ${colorset} dark:${colorset}-dark"`} />
      </Case>
      <Case condition={word.toLowerCase().includes("vscode") || word.toLowerCase().includes("visual studio")}>
        <SiVisualstudiocode className={`"inline-block my-3 w-4 h-4 mr-2 opacity-75 transition-opacity duration-150 ${colorset} dark:${colorset}-dark"`} />
      </Case>
      <Case condition={word.toLowerCase().includes("autodesk") || word.toLowerCase().includes("3ds")}>
        <SiAutodesk className={`"inline-block my-3 w-4 h-4 mr-2 opacity-75 transition-opacity duration-150 ${colorset} dark:${colorset}-dark"`} />
      </Case>
      <Case condition={word.toLowerCase().includes("arduino")}>
        <SiArduino className={`"inline-block my-2 w-6 h-6 mr-2 opacity-75 transition-opacity duration-150 ${colorset} dark:${colorset}-dark"`} />
      </Case>
    </Switch>
  )
}

const Summary = ({ profile }) => (
  <div className="flex pb-8 text-front dark:text-front-dark transition-colors duration-500">
    <div className="w-1/2 pr-4 lg:pr-12 border-r border-line dark:border-line-dark">
      <h5 className="font-header font-semibold text-sm uppercase">
        Company
      </h5>
      <h3 className="font-header font-light text-2xl leading-tight">
        {profile.company}
      </h3>
      {profile.for_hire && (
        <div className="font-header font-semibold text-xs uppercase pt-2">
          <span className="inline-block w-2 h-2 rounded-full mr-1 bg-green-500"></span>
          Available for hire
        </div>
      )}
    </div>
    <div className="w-1/2 pl-4 lg:pl-12">
      <h5 className="font-header font-semibold text-sm uppercase">
        Focused on
      </h5>
      <div className="font-header font-light text-2xl leading-tight">
        {profile.focus}
        <div className="flex flex-row content-center">
        {profile.skills.map((skill, i) =>(
          <WordParser key={skill} word={skill} colorset="" />
        ))}
        {profile.tools.map((tool, i) =>(
          <WordParser key={tool} word={tool} colorset="text-lead" />
        ))}
        </div>
        {/*profile.focus_url && (
          <div>
            <a
              aria-label="website"
              className="inline-block opacity-50 hover:opacity-75 h-4 w-4 transition-opacity duration-150"
              href={profile.focus_url}
              rel="noopener noreferrer"
              target="_blank"
            >
              <FaCompass />
            </a>
          </div>
        )*/}
      </div>
    </div>
  </div>
)

Summary.propTypes = {
  profile: shape(ProfileType),
}

export default Summary
