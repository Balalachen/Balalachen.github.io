import React, {useRef} from "react"
import { FaYoutube } from "react-icons/fa"
import { GiLaurelsTrophy } from "react-icons/gi"
import { RiFilePaper2Line } from "react-icons/ri"
import { SiGooglescholar } from "react-icons/si"
import { PublicationType } from "../../types"

function AuthorSolver({authors, fullname}){
    let authorArr = authors.split(", ");
    return (
        <>
            {authorArr.map((authorName, i) => (
                <span 
                    className={`${"inline-block text-sm font-normal "}${(i !== authorArr.length -1) ? "mr-2" : ""}${(fullname === authorName) ? " underline" : ""}`}
                >
                    {authorName}{(i !== authorArr.length -1) ? "," : "" }
                </span>
            ))}
        </>
    )
}

const Publication = props => {
    const { id, title, authors, proceedings, published, award, dwlink, videolink, selection, isCollapse, fullname } = props
    const pubDetails = useRef(null)
    return (
        <div
            className="overflow-hidden transition-all duration-150 ease-linear"
            style={{
                height: !isCollapse || selection ? pubDetails.current?.clientHeight : 0,
                opacity: !isCollapse || selection ? 100 : 0.3,
            }}
        >
            <div 
                className="pb-8 relative flex flex-col"
                ref={pubDetails}
            >
            {/*<div className="pl-2 w-8 inline-block">
                <h4 className="font-bold text-front"> [{id}] </h4>
            </div>*/}
            <div className="border-l-4 pl-4 pr-2 ">
                <h4 className="pr-2 font-bold text-front">{title}</h4>
                {/*<h4 className="pr-2 text-sm font-normal">{authors}</h4>*/}
                <h4 className="flex flex-wrap" style={{width: '90%'}}>
                    <AuthorSolver authors={authors} fullname={fullname} />
                </h4>
                {award && (
                    <div className="inline-block flex flex-row font-medium">
                        <GiLaurelsTrophy className="bg-lead text-lead-text w-6 h-6 p-1" />
                        <span className="bg-lead text-lead-text pl-2 pr-2">{award}</span>
                    </div>
                )}
                {/*<p className="pr-2 text-sm font-light italic">{proceedings}</p>*/}
                <div className="flex flex-row pt-1">
                    <p className="pr-2 py-1 text-sm font-normal opacity-50">{proceedings}</p>
                    <span className="inline-block ml-2 py-1 opacity-50 border-l-2 border-line">
                        <a 
                            href={"https://scholar.google.com/scholar?hl=zh-TW&as_sdt=0%2C5&q=" + encodeURIComponent(title) + "&btnG="}
                            rel="noreferrer noopener"
                            target="_blank"
                        >
                            <SiGooglescholar className="w-5 h-5 ml-4 mr-2 hover:opacity-25 transition-opacity duration-100" />
                        </a>
                    </span>
                    {videolink && (
                        <span className="inline-block ml-2 py-1 opacity-50 border-l-2 border-line">
                        <a 
                            href={videolink}
                            rel="noreferrer noopener"
                            target="_blank"
                        >
                            <FaYoutube className="w-5 h-5 ml-4 mr-2 hover:opacity-25 transition-opacity duration-100" />
                        </a>
                        </span>
                    )}
                    <span className="inline-block ml-2 py-1 opacity-50 border-l-2 border-line">
                        { dwlink != null ? 
                        <a 
                            href={dwlink}
                            rel="noreferrer noopener"
                            target="_blank"
                        >
                            <RiFilePaper2Line className="w-5 h-5 ml-4 mr-2 hover:opacity-25 transition-opacity duration-100" />
                        </a> : 
                        <p className="ml-4 text-sm font-normal">Accepted</p>
                        }
                    </span>
                </div>
            </div>
            </div>
        </div>
    )
}

Publication.propTypes = PublicationType

export default Publication