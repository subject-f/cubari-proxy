import React, { PureComponent } from "react";
import { SunIcon, MoonIcon } from "@heroicons/react/outline";

const themes = {
  dark: {
    rootClasses: ["dark", "bg-gray-900"],
  },
  light: {
    rootClasses: ["bg-gray-100"],
  },
};

export default class ThemeSwitcher extends PureComponent {
  constructor(props) {
    super(props);
    let theme = window.localStorage.getItem("theme");
    if (!theme) {
      window.localStorage.setItem("theme", "dark");
    }
    this.state = {
      theme,
    };
  }

  setTheme = (theme) => {
    window.localStorage.setItem("theme", theme);
    if (document.body.classList.length) {
      document.body.className = "transition-colors duration-300";
    }
    document.body.classList.add(...themes[theme].rootClasses);
    this.setState({
      theme,
    });
  };

  componentDidMount = () => {
    this.setTheme(window.localStorage.getItem("theme"));
  };

  render() {
    return (
      <button
        className="p-1 rounded-full bg-transparent focus:outline-none text-black hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white mr-4"
        onClick={() => {
          if (this.state.theme === "dark") {
            this.setTheme("light");
          } else {
            this.setTheme("dark");
          }
        }}
      >
        {this.state.theme === "dark" ? (
          <SunIcon className="h-6 w-6" />
        ) : (
          <MoonIcon className="h-6 w-6" />
        )}
      </button>
    );
  }
}
