import React, { PureComponent } from "react";
import Container from "../components/Container";
import Section from "../components/Section";
import Widget from "remotestorage-widget";
import { remoteStorage } from "../utils/remotestorage";
import Spinner from "../components/Spinner";
import { Switch } from "@headlessui/react";
import { classNames } from "../utils/strings";

const REMOTE_STORAGE_WIDGET_ID = "remote-storage-widget";
const HENTAI_KEY = "hentai";
const HENTAI_VALUE = "enabled";

export default class Settings extends PureComponent {
  constructor(props) {
    super(props);
    this.widgetRef = React.createRef();
    if (localStorage.getItem(HENTAI_KEY)) {
      localStorage.setItem(HENTAI_KEY, HENTAI_VALUE);
    }
    this.widget = new Widget(remoteStorage, {
      skipInitial: true,
      modalBackdrop: false,
      leaveOpen: true,
    });
    this.state = {
      ready: false,
      hentaiEnabled: localStorage.getItem(HENTAI_KEY),
    };
  }

  componentDidMount = () => {
    this.props.setPath("Settings");
    remoteStorage.on("ready", () => {
      if (this.widgetRef.current) {
        this.widget.attach(this.widgetRef.current.id);
        this.setState({
          ready: true,
        });
      }
    });
  };

  hentaiToggle = (state) => {
    this.setState(
      {
        hentaiEnabled: state,
      },
      () => {
        if (state) {
          localStorage.setItem(HENTAI_KEY, HENTAI_VALUE);
        } else {
          localStorage.removeItem(HENTAI_KEY);
        }
        window.location.reload();
      }
    );
  };

  render() {
    return (
      <Container>
        <Section text="Settings"></Section>
        <Section
          text="Hentai Mode"
          textSize="text-2xl"
          subText="For the horny"
        ></Section>
        <Container>
          <div className="h-full w-full mb-5 items-center sm:items-start mt-5 flex flex-wrap place-content-center sm:place-content-start">
            <Switch
              checked={this.state.hentaiEnabled}
              onChange={this.hentaiToggle}
              className={classNames(
                this.state.hentaiEnabled
                  ? "bg-blue-600 dark:bg-blue-500"
                  : "bg-gray-700 dark:bg-gray-200",
                "relative inline-flex items-center h-6 rounded-full w-11 focus:outline-none"
              )}
            >
              <span className="sr-only">Enable notifications</span>
              <span
                className={classNames(
                  this.state.hentaiEnabled ? "translate-x-6" : "translate-x-1",
                  "inline-block w-4 h-4 transform bg-white dark:bg-gray-900 rounded-full"
                )}
              />
            </Switch>
          </div>
        </Container>
        <Section
          text="Remote Storage"
          textSize="text-2xl"
          subText="[Experimental] Synchronize your reading history across different devices"
        />
        <div className="h-full w-full items-center sm:items-start mt-5 flex flex-wrap place-content-center sm:place-content-start">
          <div id={REMOTE_STORAGE_WIDGET_ID} ref={this.widgetRef}></div>
          {this.state.ready ? undefined : <Spinner />}
        </div>
      </Container>
    );
  }
}
