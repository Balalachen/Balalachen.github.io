import React, {useState, useRef} from "react"
import { arrayOf, shape, WorkHistoryModType } from "../../types"

function HistoryNote ({notes}){
    return (
        <>
            {notes.map(note => (
                <li
                    className="inline-block px-1 mr-2 font-light text-xs border-l-2 border-lead opacity-75"
                    key={note}
                >
                    {note}
                </li>
            ))}
        </>
    )
}

function HistoryList ({company, url, selection, department, position, fromtime, totime, notes, isCollapse}){
    const hsDetails = useRef(null);
    if( totime === null || totime === "" ){
        totime = "PRESENT";
    }

    return (
        <div
            className={`${"inline-box flex flex-col overflow-hidden transition-all duration-150 ease-linear bg-back "}${(!isCollapse || selection ? "mb-2 " : "")}`}
            style={{
                height: !isCollapse || selection ? hsDetails.current?.clientHeight : 0,
                opacity: !isCollapse || selection ? 100 : 0.3,
            }}
        >
            <div 
                className="p-4 border-t-4 border-line bg-back-light"
                ref={hsDetails}
            >
                <div className="flex flex-col">
                    <div className="flex flex-row">
                        {url ? (
                            <a
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:opacity-75 transition-opacity duration-150 mx-2"
                            >
                                {company}
                            </a>
                        ) : (
                            <h4 className="pr-2 text-front mx-2">{company}</h4>
                        )}
                        { position && (
                            <h4 className="text-lead font-normal ml-auto ">{position}</h4>
                        )}
                    </div>
                    <div className="flex flex-row">
                        {department && (
                            <h4 className="text-xs font-normal mx-2">{department}</h4>
                        )}
                        {totime && (
                            <span className="text-xs font-light opacity-50 ml-auto uppercase">
                                {totime}
                            </span>
                        )}
                        {fromtime && (
                            <span className="text-xs font-light opacity-50 ml-1 uppercase">
                                - {fromtime}
                            </span>
                        )}
                    </div>
                </div>
                
                {notes && (
                    <ul className="pr-2 mx-2 mt-1">
                        <HistoryNote notes={notes} />
                    </ul>
                )}
            </div>
        </div>
    )
}

function TalkList ({company, url, selection, department, position, totime, fromtime, isCollapse}){
    const thsDetails = useRef(null)

    return (
        <div
            className={`${"inline-box flex flex-col overflow-hidden transition-all duration-150 ease-linear bg-back "}${(!isCollapse || selection ? "mb-2 " : "")}`}
            style={{
                height: !isCollapse || selection ? thsDetails.current?.clientHeight : 0,
                opacity: !isCollapse || selection ? 100 : 0.3,
            }}
        >
            <div 
                className="border-l-4"
                ref={thsDetails}
            >
                <div className="flex flex-col lg:flex-row">
                    {url ? (
                        <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-normal hover:opacity-75 transition-opacity duration-150 pl-2 mx-2 text-sm"
                        >
                            {company}
                        </a>
                    ) : (
                        <h4 className="pl-2 text-front font-normal mx-2 text-sm">{company}</h4>
                    )}
                    <div className="flex flex-row">
                    { department && (
                        <h4 className="text-xs font-light mx-2 pl-2 py-1 lg:border-l-2">{department}</h4>
                    )}
                    { totime && (
                        <h4 className="text-xs font-light mx-2 pl-2 py-1 border-l-2 opacity-50">
                            {totime + ((fromtime !== "" && fromtime !== null) ? " - "+fromtime : "")}
                        </h4>
                    )}
                    </div>
                </div>
            </div>
        </div>
    )
}

const WorkHistoryList = ({ historys }) => {
    const [isCollapseWH, setIsCollapseWH] = useState(true)
    const [isCollapseTalk, setIsCollapseTalk] = useState(true)

    let subHistory = [];
    let talkHistory = [];

    for( let i=0 ; i<historys.length ; i++ ){
        if( historys[i].label === "all" || historys[i].label === "list" ){
            subHistory.push(historys[i]);
        }
        else if( historys[i].label === "short" ){
            talkHistory.push(historys[i]);
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
                "... See Complete Experience List ("+subHistory.length+")" :
                "Fold Some Experience"
            }
            </button>
        </div>

        <div className="flex flex-row mt-4">
            <h5 className="font-header font-semibold text-front text-sm uppercase mb-3" id="experience">
                Talk / Workshop
            </h5>
            <button 
                className="font-header ml-2 font-semibold underline text-front opacity-50 text-sm uppercase mb-3 hover:opacity-25 transition-opacity duration-100"
                style={{
                    visibility: !isCollapseTalk ? "visible" : "hidden",
                }}
                type="button"
                name="cp_isCollapseTalk1"
                id="cp_isCollapseTalk1"
                onClick={() => setIsCollapseTalk(!isCollapseTalk)}
            >( - Fold)</button>
        </div>

        <div className="flex flex-col">
        {talkHistory.map( (talk, i) => (
            <TalkList key={`tkhisto_${i}`} {...talk} isCollapse={isCollapseTalk} />
        ))}
        </div>
        
        <div className="flex flex-row">
            <button 
                className="font-header font-semibold underline text-front opacity-50 text-sm uppercase mb-3 ml-auto hover:opacity-25 transition-opacity duration-100"
                type="button"
                name="cp_isCollapseTalk2"
                id="cp_isCollapseTalk2"
                onClick={() => setIsCollapseTalk(!isCollapseTalk)}
            >
            {isCollapseTalk ?
                "... See Complete Talk List ("+talkHistory.length+")" :
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