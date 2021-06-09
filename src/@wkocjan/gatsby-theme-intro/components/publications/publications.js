import React, {useState} from "react"
import Publication from "./publication"
import { arrayOf, shape, PublicationType } from "../../types"

const Publications = ({ publications, fullname }) => {
    const [isCollapsePub, setIsCollapsePub] = useState(true)

    return (
    <>
        <div className="flex flex-row">
            <h5 className="font-header font-semibold text-front text-sm uppercase mb-3" id="publications">
                Publications
            </h5>
            <button 
                className="font-header ml-2 font-semibold underline text-front opacity-50 text-sm uppercase mb-3 hover:opacity-25 transition-opacity duration-100"
                style={{
                    visibility: !isCollapsePub ? "visible" : "hidden",
                }}
                type="button"
                name="cp_publications1"
                id="cp_publications1"
                onClick={() => setIsCollapsePub(!isCollapsePub)}
            >( - Fold)</button>
        </div>

        {publications.map( (publication, i) => (
            <Publication key={`Pub_${i}`} {...publication} id={`${i+1}`} isCollapse={isCollapsePub} fullname={fullname} />
        ))}

        <div className="flex flex-row">
            <button 
                className="font-header font-semibold underline text-front opacity-50 text-sm uppercase mb-3 ml-auto hover:opacity-25 transition-opacity duration-100"
                type="button"
                name="cp_publications2"
                id="cp_publications2"
                onClick={() => setIsCollapsePub(!isCollapsePub)}
            >
            {isCollapsePub ?
                "... See Complete Publication List ("+publications.length+")" :
                "Fold Some Publications"
            }
            </button>
        </div>
    </>
    )
}

Publications.propTpyes = {
    publications: arrayOf(shape(PublicationType)),
}

export default Publications