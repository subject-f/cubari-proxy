import React, { PureComponent, Fragment } from "react";
import { Menu } from "@headlessui/react";
import { classNames } from "../utils/strings";
class Tabber extends PureComponent {
  constructor(props) {
    super(props);
    if (this.props.classes.length > 0) {
      this.state = {
        selected: this.props.classes[0].name,
      };
    }
  }

  handleSelect = (selectedItem) => {
    this.setState({
      selected: selectedItem,
    });
  };

  render() {
    return (
      <Fragment>
        <Menu as="nav" className="bg-transparent">
          {this.props.classes.map((item) => {
            return (
              <button
                key={item.name}
                onClick={() => {
                  this.handleSelect(item.name);
                }}
                className={classNames(
                  this.state.selected === item.name
                    ? "bg-black text-white dark:bg-gray-800 dark:text-white"
                    : "bg-transparent text-black hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white",
                  "inline-flex items-center justify-center px-3 py-2 mx-2 rounded-md text-md font-medium focus:outline-none"
                )}
              >
                <img
                  src={item.icon.default}
                  className="h-8 w-8"
                  alt={item.name}
                />
                <div className="lg:block hidden px-3">{item.name}</div>
              </button>
            );
          })}
        </Menu>
        {this.props.items.map((item) =>
          item.key.includes(this.state.selected) ? item : undefined
        )}
      </Fragment>
    );
  }
}

export default Tabber;
