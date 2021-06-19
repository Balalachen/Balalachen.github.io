import React from "react"
import Location from "./location"
import ProfileImage from "./profile-image"
import { arrayOf, shape, ProfileType, SocialType } from "../../types"
import SocialLinks from "../social-links/social-links"
import WorkHistory from "../work-history/work-history"

const Sidebar = ({ profile, social, history }) => (
  <aside className="w-full lg:w-1/3 lg:border-r border-line dark:border-line-dark lg:px-6 xl:px-12 transition-colors duration-500">
    <div className="flex flex-col h-full justify-between">
    <div className="auto flex flex-wrap">
      <div>
        <h2 className="font-header font-light text-front dark:text-front-dark text-2xl leading-none mb-4 transition-colors duration-500">
          {profile.profession}
        </h2>
        <h1 className="font-header font-black text-front dark:text-front-dark text-5xl leading-none break-words mb-6 transition-colors duration-500">
          {profile.name}
        </h1>
        {profile.image && (
          <ProfileImage image={profile.image} name={profile.name} />
        )}
        <br />
        {profile.location && (
          <Location
            location={profile.location}
            relocation={profile.relocation}
          />
        )}
      </div>

      <div className="ml-auto pr-2 mr-5 w-1/2 hidden lg:block lg:w-full lg:mr-0">
        <WorkHistory history={history} />
      </div>
    </div>

      <div className="pt-8 pb-12 lg:py-0">
        <h5 className="font-header font-semibold text-front dark:text-front-dark text-sm uppercase mb-3 transition-colors duration-500">
          Connect
        </h5>
        <SocialLinks social={social} />
      </div>
    </div>
  </aside>
)

Sidebar.propTypes = {
  profile: shape(ProfileType),
  social: arrayOf(shape(SocialType)),
}

export default Sidebar
