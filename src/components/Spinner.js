import React, { PureComponent } from "react";
import { RefreshIcon } from "@heroicons/react/outline";

export default class Spinner extends PureComponent {
  render() {
    return (
      <div className="w-full flex place-content-center pt-10 pb-10">
        <RefreshIcon className="text-black dark:text-white animate-spin block h-12 w-12" />
      </div>
    );
  }
}
