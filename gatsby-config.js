module.exports = {
  siteMetadata: {
    description: "Personal page of Bala Chen",
    locale: "zh-TW",
    title: "Bala Chen",
    formspreeEndpoint: "https://formspree.io/f/{your-id}",
  },
  pathPrefix: '',
  plugins: [
    {
      resolve: "@wkocjan/gatsby-theme-intro",
      options: {
        basePath: "/",
        contentPath: "content/",
        showThemeLogo: true,
        theme: {
          'back': '#d0dde3',
          'front': '#1f1f1f',
          'lead': '#0abae6',
          'lead-text': '#ffffff',
          'line': '#a9bfc9',
          'skill-1': '#073eb9',
          'skill-2': '#1f58da',
          'skill-3': '#4073e8',
          'back-dark': '#222831',
          'front-dark': '#bdc5d0',
          'lead-dark': '#125fec',
          'lead-text-dark': '#eeeeee',
          'line-dark': '#29303a',
          'skill-1-dark': '#0077b5',
          'skill-2-dark': '#00adb5',
          'skill-3-dark': '#854af0',
          "back-light-dark": '#222222'
        },
      },
    },
  ],
}
