module.exports = ({ actions }) => {
  actions.createTypes(`
    type WorkHistoryModYaml implements Node {
      id: ID!
      company: String!
      department: String
      fromtime: String
      totime: String
      position: String
      url: String
      label: String!
      selection: Boolean!
      notes: [String]
    }

    type ProjectsModYaml implements Node {
      id: ID!
      name: String!
      description: String
      selection: Boolean!
      status: String
      position: String
      tags: [String]
      image: File @fileByRelativePath
      icon: [String]
      url: [String]
      awards: [String]
      exhibitions: [String]
    }

    type PublicationsYaml implements Node{
      id: ID!
      title: String!
      authors: String!
      proceedings: String
      published: String
      selection: Boolean!
      award: String
      dwlink: String
      videolink: String
    }
    
  `)
}
