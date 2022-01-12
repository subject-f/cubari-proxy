import React, { PureComponent } from "react";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@heroicons/react/outline";
import { classNames } from "../utils/strings";
import Spinner from "./Spinner";

const SCROLL_THRESHOLD = 20;
const LOAD_BATCH_COUNT = 6;

export default class ScrollableCarousel extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      fullyLeftScrolled: true,
      fullyRightScrolled: true,
      isButtonHovered: false,
      scrolling: false,
      itemLength: 0,
      expanded: false,
    };
    // While a shared observer would be preferable, we lose
    // the virtual DOM context here so we'll instead bind it
    // per scrollable carousel
    this.ref = React.createRef();
    this.componentRef = React.createRef();
    this.observer = new IntersectionObserver(this.observerCallback);
  }

  observerCallback = (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        this.setState(
          {
            itemLength: LOAD_BATCH_COUNT,
          },
          this.scrollPositionHandler
        );
        this.observer.unobserve(entry.target);
        delete this.observer;
      }
    });
  };

  scrollPositionHandler = () => {
    if (this.ref.current) {
      let fullyLeftScrolled = this.ref.current.scrollLeft < SCROLL_THRESHOLD;
      let fullyRightScrolled =
        this.ref.current.scrollLeft + this.ref.current.clientWidth >
        this.ref.current.scrollWidth - SCROLL_THRESHOLD;
      if (
        fullyRightScrolled &&
        this.state.itemLength < this.props.children.length
      ) {
        this.setState({
          itemLength: this.state.itemLength + LOAD_BATCH_COUNT,
        });
      } else {
        this.setState({
          fullyLeftScrolled,
          fullyRightScrolled,
        });
      }
    }
  };

  _scroller = (modifier) => {
    if (!this.state.scrolling) {
      this.ref.current.classList.add("overflow-x-hidden");
      let elementWidth = this.ref.current.lastChild.lastChild.clientWidth;
      let containerWidth = this.ref.current.clientWidth;
      let currentPosition = this.ref.current.scrollLeft;
      // The amount we scroll will be the number of elements that can be displayed
      // on the screen, while snapping the new position to the nearest element
      // (which is accounted by the addition subtraction of the leftover scroll amount)
      let amount =
        elementWidth * Math.floor(containerWidth / elementWidth) +
        (elementWidth * Math.ceil(currentPosition / elementWidth) -
          currentPosition) *
          modifier;
      if (amount < elementWidth) {
        amount = elementWidth;
      }
      let steps = 0;
      let maxSteps = 20;
      let scroller = () => {
        // This emulates an ease-in-out function
        let x = steps / maxSteps;
        let functor = (x * x) / (2 * (x * x - x) + 1);
        this.ref.current.scrollLeft =
          currentPosition + functor * amount * modifier;
        steps++;
        if (steps < maxSteps) {
          window.requestAnimationFrame(scroller);
        } else {
          this.ref.current.classList.remove("overflow-x-hidden");
          this.setState({
            scrolling: false,
          });
        }
      };
      window.requestAnimationFrame(scroller);
      this.setState({
        scrolling: true,
      });
    }
  };

  scrollLeft = () => {
    this._scroller(-1);
  };

  scrollRight = () => {
    this._scroller(1);
  };

  componentDidMount = () => {
    this.observer.observe(this.componentRef.current);
    if (this.props.expanded) {
      this.setState({
        expanded: true
      });
    }
    window.addEventListener("resize", this.scrollPositionHandler);
  };

  componentWillUnmount = () => {
    window.removeEventListener("resize", this.scrollPositionHandler);
  };

  onMouseEnter = () =>
    this.setState({
      isButtonHovered: true,
    });

  onMouseLeave = () =>
    this.setState({
      isButtonHovered: false,
    });

  onExpandToggle = () => {
    this.setState({
      expanded: !this.state.expanded,
    });
  };

  render() {
    const { expanded, fullyLeftScrolled, fullyRightScrolled, isButtonHovered } =
      this.state;
    const { iconSize = 8, expandable } = this.props;

    return (
      <div className="relative w-full h-full" ref={this.componentRef}>
        <div
          hidden={fullyLeftScrolled && !isButtonHovered}
          className={classNames(
            fullyLeftScrolled || expanded ? "opacity-0" : "opacity-100",
            "absolute select-none -left-2 top-1/2 transform -translate-y-1/2 z-10 transition-all duration-250"
          )}
        >
          <div
            className="cursor-pointer sticky bg-gray-900 text-white dark:bg-white dark:text-black rounded-full p-2 shadow-2xl transform scale-95 hover:scale-100 opacity-40 sm:opacity-80 hover:opacity-100 transition-opacity transition-transform duration-250"
            onClick={this.scrollLeft}
            onMouseEnter={this.onMouseEnter}
            onMouseLeave={this.onMouseLeave}
          >
            <ArrowLeftIcon
              className={`rounded-full z-10 p-0 w-${iconSize} h-${iconSize}`}
              aria-hidden="true"
            />
          </div>
        </div>
        {this.state.itemLength ? (
          <div
            ref={this.ref}
            className={classNames(
              expanded
                ? ""
                : "static w-full h-full flex overflow-x-auto no-scrollbar select-none",
              "pb-1 pt-1"
            )}
            onScroll={this.scrollPositionHandler}
          >
            <div
              className={classNames(
                expanded ? "flex-wrap" : "flex-nowrap",
                "flex mt-1 mb-1"
              )}
            >
              {Array.isArray(this.props.children)
                ? expanded
                  ? this.props.children
                  : this.props.children.slice(0, this.state.itemLength)
                : this.props.children}
            </div>
          </div>
        ) : this.props.children.length ? (
          <Spinner />
        ) : undefined}
        <div
          hidden={fullyRightScrolled && !isButtonHovered}
          className={classNames(
            fullyRightScrolled || expanded ? "opacity-0" : "opacity-100",
            "absolute select-none -right-2 top-1/2 transform -translate-y-1/2 z-10 transition-all duration-250"
          )}
        >
          <div
            className="cursor-pointer  bg-gray-900 text-white dark:bg-white dark:text-black rounded-full p-2 shadow-2xl transform scale-95 hover:scale-100 opacity-40 sm:opacity-80 hover:opacity-100 transition-opacity transition-transform duration-250"
            onClick={this.scrollRight}
            onMouseEnter={this.onMouseEnter}
            onMouseLeave={this.onMouseLeave}
          >
            <ArrowRightIcon
              className={`rounded-full z-10 p-0 w-${iconSize} h-${iconSize}`}
              aria-hidden="true"
            />
          </div>
        </div>
        <div>
          {expandable && !(fullyLeftScrolled && fullyRightScrolled) ? (
            <div
              className={classNames(
                "w-full flex justify-center",
                "cursor-pointer text-black dark:text-white",
                "transform scale-95 hover:scale-100",
                "opacity-40 sm:opacity-80 hover:opacity-100 transition-opacity transition-transform duration-250"
              )}
              onClick={this.onExpandToggle}
              onMouseEnter={this.onMouseEnter}
              onMouseLeave={this.onMouseLeave}
            >
              {expanded ? (
                <ChevronUpIcon
                  className={`rounded-full z-10 p-0 w-${iconSize} h-${iconSize}`}
                  aria-hidden="true"
                />
              ) : (
                <ChevronDownIcon
                  className={`rounded-full z-10 p-0 w-${iconSize} h-${iconSize}`}
                  aria-hidden="true"
                />
              )}
            </div>
          ) : undefined}
        </div>
      </div>
    );
  }
}
