import { graphql } from "gatsby"
import { string, oneOf, bool, arrayOf } from "prop-types"

export const WorkHistoryModType = {
  company: string.isRequired,
  department: string,
  fromtime: string,
  totime: string,
  position: string,
  url: string,
  label: oneOf(["summery", "list", "all", "short"]),
  selection: bool,
  notes: arrayOf(string)
}

export const query = graphql`
  fragment WorkHistoryModFragment on WorkHistoryModYaml {
    company
    department
    fromtime
    totime
    position
    url
    label
    selection
    notes
  }
`
