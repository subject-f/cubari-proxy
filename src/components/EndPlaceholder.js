import React, { PureComponent } from "react";
import { CheckIcon } from "@heroicons/react/outline";
import { classNames } from "../utils/strings";
import Card from "./Card";

export default class EndPlaceholder extends PureComponent {
  render() {
    return (
      <Card>
        <div
          className={classNames(
            "bg-black/5 dark:bg-white/5",
            "border-solid border-2 border-black/25 dark:border-white/25",
            "rounded-lg",
            "flex flex-row flex-wrap p-1",
            "w-full h-full",
            "text-sm sm:text-base",
            "text-black/25 dark:text-white/25",
            "transition-all duration-300 py-12"
          )}
        >
          <div className="w-full h-full px-0 flex flex-row flex-wrap place-content-center overflow-hidden">
            <CheckIcon className={"h-10 w-10"} />
          </div>
        </div>
      </Card>
    );
  }
}
