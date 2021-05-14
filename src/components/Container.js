import React, { PureComponent } from "react";

export default class Container extends PureComponent {
  render() {
    return (
      <div className="container mx-auto max-w-6xl pb-10">
        <div className="w-full h-full bg-transparent flex flex-wrap place-items-center p-3">
          {this.props.children}
        </div>
      </div>
    );
  }
}
