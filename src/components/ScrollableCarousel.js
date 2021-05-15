import React, { PureComponent } from "react";
import { ArrowLeftIcon, ArrowRightIcon } from "@heroicons/react/outline";
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
      scrolling: false,
      items: [],
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
            items: this.props.children.slice(0, LOAD_BATCH_COUNT),
          },
          this.scrollPositionHandler
        );
        this.observer.unobserve(entry.target);
        delete this.observer;
      }
    });
  };

  scrollPositionHandler = () => {
    // TODO add scroll snapping?
    let fullyLeftScrolled = this.ref.current.scrollLeft < SCROLL_THRESHOLD;
    let fullyRightScrolled =
      this.ref.current.scrollLeft + this.ref.current.clientWidth >
      this.ref.current.scrollWidth - SCROLL_THRESHOLD;
    if (
      fullyRightScrolled &&
      this.state.items.length < this.props.children.length
    ) {
      this.setState({
        items: this.props.children.slice(
          0,
          this.state.items.length + LOAD_BATCH_COUNT
        ),
      });
    } else {
      this.setState({
        fullyLeftScrolled,
        fullyRightScrolled,
      });
    }
  };

  _scroller = (modifier) => {
    if (!this.state.scrolling) {
      let elementWidth = this.ref.current.lastChild.lastChild.clientWidth;
      let containerWidth = this.ref.current.clientWidth;
      let amount = elementWidth * Math.floor(containerWidth / elementWidth);
      let steps = 0;
      let maxSteps = 20;
      let currentPosition = this.ref.current.scrollLeft;
      let scroller = () => {
        // This emulates an ease-in-out function
        let functor = (Math.sin((steps / maxSteps - 0.5) * Math.PI) + 1) * 0.5;
        this.ref.current.scrollLeft =
          currentPosition + functor * amount * modifier;
        steps++;
        if (steps < maxSteps) {
          window.requestAnimationFrame(scroller);
        } else {
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
  };

  render() {
    return (
      <div className="relative w-full h-full" ref={this.componentRef}>
        <div
          className={classNames(
            this.state.fullyLeftScrolled
              ? "opacity-0 pointer-events-none"
              : "opacity-100",
            "absolute cursor-pointer select-none left-0 md:-left-4 top-1/2 z-10 transition-all duration-250"
          )}
        >
          <div className="sticky bg-gray-900 text-white dark:bg-white dark:text-black rounded-full p-2 shadow-2xl transform scale-95 hover:scale-100 opacity-80 hover:opacity-100 transition-opacity transition-transform duration-250">
            <ArrowLeftIcon
              className="rounded-full z-10 p-0 w-8 h-8"
              aria-hidden="true"
              onClick={this.scrollLeft}
            />
          </div>
        </div>
        {this.state.items.length ? (
          <div
            ref={this.ref}
            className="static w-full h-full flex overflow-x-auto pb-1 pt-5 select-none"
            onScroll={this.scrollPositionHandler}
          >
            <div className="flex flex-nowrap mt-4 mb-4">{this.state.items}</div>
          </div>
        ) : (
          <Spinner />
        )}
        <div
          className={classNames(
            this.state.fullyRightScrolled
              ? "opacity-0 pointer-events-none"
              : "opacity-100",
            "absolute cursor-pointer select-none right-0 md:-right-4 top-1/2 z-10 transition-all duration-250"
          )}
        >
          <div className="bg-gray-900 text-white dark:bg-white dark:text-black rounded-full p-2 shadow-2xl transform scale-95 hover:scale-100 opacity-80 hover:opacity-100 transition-opacity transition-transform duration-250">
            <ArrowRightIcon
              className="rounded-full z-10 p-0 w-8 h-8"
              aria-hidden="true"
              onClick={this.scrollRight}
            />
          </div>
        </div>
      </div>
    );
  }
}
