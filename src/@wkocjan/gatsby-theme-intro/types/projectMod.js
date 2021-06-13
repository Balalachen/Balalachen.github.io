import { graphql } from "gatsby"
import { arrayOf, shape, string, object, bool } from "prop-types"

export const ProjectModType = {
  description: string,
  selection: bool.isRequired,
  image: shape({
    childImageSharp: object.isRequired,
  }),
  name: string.isRequired,
  status: string,
  position: string,
  tags: arrayOf(string),
  url: arrayOf(string),
  awards: arrayOf(string),
  exhibitions: arrayOf(string)
}

export const query = graphql`
  fragment ProjectModFragment on ProjectsModYaml {
    name
    description
    selection
    status
    position
    tags
    image {
      childImageSharp {
        gatsbyImageData(width: 640, quality: 85)
      }
    }
    url
    awards
    exhibitions
  }
`
