import React, { PureComponent } from "react";

export default class Text extends PureComponent {
  render() {
    return (
      <section className="w-full flex-grow pt-2">
        <div className="w-full flex-grow">
          <p className="text-base text-gray-700 dark:text-gray-300 font-normal leading-loose">
            {this.props.text ? this.props.text : this.props.children}
          </p>
        </div>
      </section>
    );
  }
}
