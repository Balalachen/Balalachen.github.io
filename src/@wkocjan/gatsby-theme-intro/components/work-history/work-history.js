import React, {useState} from "react"
import { arrayOf, shape, WorkHistoryModType } from "../../types"
import "./work-history.css"

function HistoryPoint({idx, ml, company, department, fromtime, totime, position, url, isHover}){
  // const [isHover, setIsHover] = useState(false)
  let alpha = Math.max(25, 100 - idx*25);

  return (
    <div 
      className="relative py-4"
      style={{
        paddingLeft: (ml + 1.25) + 'em'
      }}
    >
      {/*<span className="dot-bg w-7 h-7 absolute bg-line inline-flex items-center justify-center">
        <span className="dot w-3 h-3 bg-back-light" />
      </span>
      */}
      <span 
        className={`${"dot-shift rounded-full absolute inline-flex items-center justify-center w-2 h-2 bg-lead mt-6 opacity-"}${alpha}`}
        style={{
          left: ml+'em'
        }}
      />
      <div 
        className="flex flex-col"
        /*onMouseEnter={() => setIsHover(true)}
        onMouseLeave={() => setIsHover(false)}*/
      >
      {url ? (
        <h4 className="subpixel-antialiased">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium hover:opacity-75 transition-opacity duration-150"
          >
            {company}
          </a>
        </h4>
      ) : (
        <h4 className="font-medium subpixel-antialiased">{company}</h4>
      )}
      {department && (
        <h4 className="text-xs font-normal subpixel-antialiased"> - {department}</h4>
      )}
      {position && (
        <h5 className="text-sm font-medium mt-1">{position}</h5>
      )}
      {fromtime && (
        <span 
          className="text-xs font-normal opacity-0 transition-opacity duration-100"
          style={{
            opacity: isHover ? '50%' : '0%'
          }}
        >
          {fromtime} - {totime}
        </span>
      )}
    </div>
    </div>
  )
}

function TimeBorderLine ({idx, ml, fromtime, totime, isHover}) {
  let basedDate = new Date("2012/09").getTime();
  let maxDate = Date.now();
  let timeGap = maxDate - basedDate;
  let fValue = new Date(fromtime).getTime();
  let tValue = (totime.toLowerCase() === "present") ? maxDate : new Date(totime).getTime();

  if( fValue < basedDate ){
    fValue = basedDate;
  }

  let hPercent = Math.min((tValue - fValue) / timeGap, 1) * 100;
  let cssTop = Math.min((maxDate - tValue) / timeGap, 1) * 100;
  let alpha = Math.max(25, 100 - idx*25);

  // check base
  // hPercent += (cssTop + hPercent) < (100*(idx/len)+5) ? (100*(idx/len)+5) - (cssTop + hPercent) : 0;

  return (
    <span 
      className={`${"absolute border-l-2 transition-all duration-100 "}${isHover ? "border-front" : "border-lead"}`}
      style={{
        top: cssTop+'%',
        left: (ml + 0.2)+'em',
        height: hPercent+'%',
        opacity: (isHover ? 50 : alpha)+'%',
      }}
    />
  )
}

const WorkHistory = ({ history }) => {
  const [isHoverID, setIsHoverID] = useState(-1)
  let subHistory = [];
  for( let i=0 ; i<history.length ; i++ ){
    if( history[i].label === "all" || history[i].label === "summery" ){
      subHistory.push(history[i]);
    }
  }

  return (
    <>
      <h5 className="font-header font-semibold text-front text-sm uppercase mt-7 mb-3 text-left hidden lg:block">
        Work history
      </h5>
      <div className="flex flex-col relative pt-6 pb-6 ml-0">
        <span className="absolute border-l-2 h-full w-2" style={{top:0, left:0}} />
        {subHistory.map((hp, i) => (
          <div
            onMouseEnter={() => setIsHoverID(i)}
            onMouseLeave={() => setIsHoverID(-1)}
          >
            <span 
              className="absolute border-l-2 h-full w-2 opacity-50" 
              style={{
                top:0, 
                left: ((subHistory.length - 1 - i)*0.5 + 0.25 + 0.2) +'em',
                height: ((i+1)*100/subHistory.length - 2) + '%'
              }} 
            />
            <TimeBorderLine 
              idx = {i}
              ml = {(subHistory.length - 1 - i)*0.5 + 0.25}
              fromtime = {hp.fromtime}
              totime = {hp.totime}
              isHover = { i === isHoverID }
            />
            <HistoryPoint 
              idx = {i}
              ml = {(subHistory.length - 1 - i)*0.5 + 0.25}
              key = {"HP"+i.toString()}
              {...hp}
              isHover = { i === isHoverID }
            />
          </div>
        ))}
      </div>
    </>
  )
}

WorkHistory.propTypes = {
  history: arrayOf(shape(WorkHistoryModType)),
}

export default WorkHistory
