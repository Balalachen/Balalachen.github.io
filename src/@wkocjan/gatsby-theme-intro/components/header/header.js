import React from "react"
import { FaEnvelope } from "react-icons/fa"
import { IoIosSunny, IoIosMoon} from "react-icons/io"
import { ProfileType } from "../../types"
import useDarkMode from "../../hooks/useDarkMode"

function DarkModeBtn () {
  const [colorTheme, setTheme] = useDarkMode()

  return (
    <span className="inline-flex px-2 mt-4 lg:mt-6 ml-auto mr-2">
      <IoIosSunny className={`${"w-5 h-5 my-0.5 lg:w-4 lg:h-4 transition-all duration-200 text-lead dark:text-lead-dark "}${(colorTheme === 'dark') ? "opacity-100" : "opacity-25"}`} />
      <button 
        name="darkModeBtn"
        id="darkModeBtn"
        role="switch"
        className={`${"inline-flex items-center px-0.5 mx-1 rounded-full w-11 h-6 lg:w-10 lg:h-5 transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white focus-visible:ring-gray-500 focus:outline-none "}${(colorTheme === 'dark') ? "bg-lead" : "bg-lead-dark"}`}
        aria-checked={(colorTheme === 'dark') ? true : false}
        onClick={() => setTheme(colorTheme)}
      >
        <span className="sr-only">Enable dark mode</span>
        <span className={`${"bg-white rounded-full w-5 h-5 lg:w-4 lg:h-4 transition-all duration-200 "}${(colorTheme === 'dark') ? "ml-0" : "ml-5"}`}></span>
      </button>
      <IoIosMoon className={`${"w-5 h-5 my-0.5 lg:w-4 lg:h-4 transition-all duration-200 text-lead dark:text-lead-dark "}${(colorTheme === 'dark') ? "opacity-25" : "opacity-100"}`} />
    </span>
  )
}

const Header = ({ initials }) => (
  <header className="flex justify-between p-4 lg:px-8">
    <span className="inline-flex w-14 h-14 lg:mt-4 font-header font-bold text-xl justify-center items-center text-center text-front dark:text-front-dark border-2 border-solid border-front dark:border-front-dark rounded-full transition-colors duration-500">
      {initials}
    </span>
    <DarkModeBtn />
    <a
      className="flex w-14 h-14 font-header font-semibold px-2 bg-lead dark:bg-lead-dark rounded-full text-lead-text dark:text-lead-text-dark justify-center items-center leading-tight lg:w-auto lg:h-auto lg:px-6 lg:py-2 lg:rounded-lg lg:self-start lg:mt-4 hover:opacity-75 transition-all duration-150"
      href="#contact"
    >
      <FaEnvelope className="inline-block h-6 w-6 lg:hidden" />
      <span className="hidden lg:block">Contact me</span>
    </a>
  </header>
)

Header.propTypes = {
  initials: ProfileType.initials,
}

export default Header
