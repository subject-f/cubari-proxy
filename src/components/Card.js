import React, { PureComponent } from "react";
import { classNames } from "../utils/strings";
import { tailwindConfig } from "../utils/tailwind";

const breakpointElementCountMap = {
  xs: 1,
  sm: 2,
  md: 3,
  lg: 4,
  xl: 5,
  "2xl": 6,
};

const breakpoints = Object.entries(tailwindConfig.theme.screens).map(
  ([breakpoint, pixelValue]) => [
    pixelValue.slice(0, -2),
    breakpointElementCountMap[breakpoint],
  ]
);

export default class Card extends PureComponent {
  constructor(props) {
    super(props);
    this.containerRef = React.createRef();
    this.state = {
      elementWidthCalculated: false,
      elementWidth: 225, // We need a default width for other pre-init calculations
    };
  }

  resizeHandler = () => {
    // Note: this handler is ugly as _fuck_, but it's one way of
    // resizing the element without the parent scroller passing any state
    // down, which means its size is contained within this component.
    // Tradeoffs, I suppose.

    const flexboxScrollable = this.containerRef.current.parentElement;
    const actualContainer = flexboxScrollable.parentElement;
    const actualContainerWidth = actualContainer.clientWidth;

    let finalElements = 0;
    for (const [breakpoint, elements] of breakpoints) {
      if (actualContainerWidth < parseInt(breakpoint)) {
        finalElements = elements;
        break;
      }
    }

    this.setState({
      elementWidthCalculated: true,
      elementWidth: actualContainerWidth / finalElements,
    });
  };

  componentDidMount = () => {
    this.resizeHandler();
    window.addEventListener("resize", this.resizeHandler);
  };

  componentWillUnmount = () => {
    window.removeEventListener("resize", this.resizeHandler);
  };

  render() {
    return (
      <div
        ref={this.containerRef}
        className={classNames(
          "transition-opacity duration-500 ease-in-out",
          !this.state.elementWidthCalculated
            ? "opacity-0"
            : "opacity-100"
        )}
        style={{
          willChange: "transform",
          width: `${this.state.elementWidth}px`,
          height: `${this.state.elementWidth * 1.4}px`
        }}
      >
        <div className="p-2 sm:p-3 md:p-4 w-full h-full">{this.props.children}</div>
      </div>
    );
  }
}
