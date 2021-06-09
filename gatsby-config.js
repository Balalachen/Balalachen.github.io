module.exports = {
  siteMetadata: {
    description: "Personal page of Bala Chen",
    locale: "zh-TW",
    title: "Bala Chen",
    formspreeEndpoint: "https://formspree.io/f/{your-id}",
  },
  pathPrefix: '/Balalachen.github.io',
  plugins: [
    {
      resolve: "@wkocjan/gatsby-theme-intro",
      options: {
        basePath: "/",
        contentPath: "content/",
        showThemeLogo: true,
        theme: "blue",
      },
    },
  ],
}
