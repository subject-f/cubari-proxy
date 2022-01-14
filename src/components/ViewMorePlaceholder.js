import React, { PureComponent } from "react";
import { ViewGridAddIcon } from "@heroicons/react/outline";
import { classNames } from "../utils/strings";
import Spinner from "./Spinner";
import Card from "./Card";

export default class ViewMorePlaceholder extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      triggered: false,
    };
  }

  render() {
    return (
      <Card>
        <div
          className={classNames(
            this.state.triggered
              ? "bg-transparent"
              : "bg-black/5 dark:bg-white/5",
            this.state.triggered
              ? "border-none"
              : "border-dashed border-2 border-black/25 dark:border-white/25 hover:border-black hover:dark:border-white",
            this.state.triggered ? "cursor-wait" : "cursor-pointer",
            "transform rounded-lg",
            "flex flex-row flex-wrap p-1",
            "w-full h-full",
            "text-sm sm:text-base",
            "text-black/25 dark:text-white/25 hover:text-black/75 hover:dark:text-white/75",
            "transition-all duration-300 py-12"
          )}
          onClick={() => {
            this.setState({ triggered: true }, this.props.onClickHandler);
          }}
          style={{ willChange: "transform" }}
        >
          <div className="w-full h-full px-0 flex flex-row flex-wrap place-content-center overflow-hidden">
            {this.state.triggered ? (
              <Spinner />
            ) : (
              <ViewGridAddIcon className={"h-10 w-10"} />
            )}
          </div>
        </div>
      </Card>
    );
  }
}
