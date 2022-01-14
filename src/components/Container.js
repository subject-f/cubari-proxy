import React, { PureComponent } from "react";

export default class Container extends PureComponent {
  render() {
    return (
      <div className="container mx-auto my-auto max-w-6xl pb-5">
        <div className="w-full h-full bg-transparent flex flex-wrap place-content-center md:place-content-start place-items-center p-3">
          {this.props.children}
        </div>
      </div>
    );
  }
}
