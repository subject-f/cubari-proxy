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
      window.localStorage.setItem("theme", "light");
    }
    this.state = {
      theme,
    };
  }

  setTheme = (theme) => {
    window.localStorage.setItem("theme", theme);
    document.body.className = "";
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
      <div className="p-1 rounded-full bg-transparent text-black hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white ml-3 mr-3">
        {this.state.theme === "dark" ? (
          <SunIcon className="h-6 w-6" onClick={() => this.setTheme("light")} />
        ) : (
          <MoonIcon className="h-6 w-6" onClick={() => this.setTheme("dark")} />
        )}
      </div>
    );
  }
}
