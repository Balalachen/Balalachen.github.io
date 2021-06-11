import React, {useState, useRef} from "react"
import { arrayOf, shape, WorkHistoryModType } from "../../types"

function HistoryNote ({notes}){
    return (
        <>
            {notes.map(note => (
                <li
                    className="inline-block px-3 py-1 mr-1 font-medium text-xs rounded-lg border border-lead opacity-75"
                    key={note}
                >
                    {note}
                </li>
            ))}
        </>
    )
}

function HistoryList ({company, url, selection, department, position, fromtime, totime, notes, isCollapse}){
    const hsDetails = useRef(null)

    return (
        <div
            className="inline-box flex flex-col overflow-hidden transition-all duration-150 ease-linear bg-back"
            style={{
                height: !isCollapse || selection ? hsDetails.current?.clientHeight : 0,
                opacity: !isCollapse || selection ? 100 : 0.3,
            }}
        >
            <div 
                className="pr-2 pb-2 mt-2"
                ref={hsDetails}
            >
                <div className="border-l-4 flex flex-col">
                    <div className="flex flex-row">
                    {url ? (
                        <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:opacity-75 transition-opacity duration-150 mx-2 font-bold"
                        >
                            {company}
                        </a>
                    ) : (
                        <h4 className="pr-2 font-bold text-front mx-2">{company}</h4>
                    )}
                    {totime && (
                        <>
                        <span className="border-t-2 opacity-50 flex-1 mt-2 h-1 mx-2" />
                        <span className="text-sm font-normal opacity-50 ml-auto uppercase">
                            {totime}
                        </span>
                        </>
                    )}
                    </div>
                    <div className="flex flex-row">
                        {department && (
                            <h4 className="text-xs font-medium subpixel-antialiased ml-4"> - {department}</h4>
                        )}
                        {fromtime && (
                            <span className="text-xs font-normal opacity-50 ml-auto uppercase">
                                {fromtime}
                            </span>
                        )}
                    </div>
                </div>
                
                {position && (
                    <h5 className="text-sm font-normal ml-4 mt-1">{position}</h5>
                )}
                {notes && (
                    <ul className="pr-2 ml-1 mt-1">
                        <HistoryNote notes={notes} />
                    </ul>
                )}
            </div>
        </div>
    )
}

const WorkHistoryList = ({ historys }) => {
    const [isCollapseWH, setIsCollapseWH] = useState(true)
    let subHistory = [];
    for( let i=0 ; i<historys.length ; i++ ){
        if( historys[i].label === "all" || historys[i].label === "list" ){
        subHistory.push(historys[i]);
        }
    }

    return (
    <>
        <div className="flex flex-row">
            <h5 className="font-header font-semibold text-front text-sm uppercase mb-3" id="experience">
                Experience
            </h5>
            <button 
                className="font-header ml-2 font-semibold underline text-front opacity-50 text-sm uppercase mb-3 hover:opacity-25 transition-opacity duration-100"
                style={{
                    visibility: !isCollapseWH ? "visible" : "hidden",
                }}
                type="button"
                name="cp_isCollapseWH1"
                id="cp_isCollapseWH1"
                onClick={() => setIsCollapseWH(!isCollapseWH)}
            >( - Fold)</button>
        </div>
        
        <div className="flex flex-col">
        {subHistory.map( (history, i) => (
            <HistoryList key={`histo_${i}`} {...history} isCollapse={isCollapseWH} />
        ))}
        </div>
        
        <div className="flex flex-row">
            <button 
                className="font-header font-semibold underline text-front opacity-50 text-sm uppercase mb-3 ml-auto hover:opacity-25 transition-opacity duration-100"
                type="button"
                name="cp_isCollapseWH2"
                id="cp_isCollapseWH2"
                onClick={() => setIsCollapseWH(!isCollapseWH)}
            >
            {isCollapseWH ?
                "... See Complete Publication List ("+historys.length+")" :
                "Fold Some Experience"
            }
            </button>
        </div>
    </>
    )
}

WorkHistoryList.propTypes = {
    historys: arrayOf(shape(WorkHistoryModType)),
}

export default WorkHistoryList