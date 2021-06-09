import { graphql } from "gatsby"
import { string, bool } from "prop-types"

export const PublicationType = {
    title: string.isRequired,
    authors: string.isRequired,
    proceedings: string,
    published: string,
    selection: bool,
    award: string,
    dwlink: string,
    videolink: string
}

export const query = graphql`
    fragment PublicationFragment on PublicationsYaml{
        title
        authors
        proceedings
        published
        selection
        award
        dwlink
        videolink
    }
`