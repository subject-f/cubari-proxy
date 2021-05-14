import React, { PureComponent } from "react";

export default class ScrollableCarousel extends PureComponent {
  render() {
    return (
      <div className="w-full h-full flex overflow-x-auto pb-1 pt-2 select-none">
        <div className="flex flex-nowrap space-x-4 mt-4 mb-4">
          {this.props.children}
        </div>
      </div>
    );
  }
}
