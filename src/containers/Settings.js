import React, { PureComponent } from "react";
import Container from "../components/Container";
import Section from "../components/Section";
import Widget from "remotestorage-widget";
import { remoteStorage } from "../utils/remotestorage";
import Spinner from "../components/Spinner";

const REMOTE_STORAGE_WIDGET_ID = "remote-storage-widget";

export default class Settings extends PureComponent {
  constructor(props) {
    super(props);
    this.widgetRef = React.createRef();
    this.widget = new Widget(remoteStorage, {
      skipInitial: true,
      modalBackdrop: false,
      leaveOpen: true,
    });
    this.state = {
      ready: false,
    };
  }

  componentDidMount = () => {
    remoteStorage.on("ready", () => {
      if (this.widgetRef.current) {
        this.widget.attach(this.widgetRef.current.id);
        this.setState({
          ready: true,
        });
      }
    });
  };

  render() {
    return (
      <Container>
        <Section text="Settings"></Section>
        <Section
          text="Remote Storage"
          subText="[Experimental] Synchronize your reading history across different devices"
        />
        <div className="h-full w-full items-center mt-5 flex flex-wrap place-content-center">
          <div id={REMOTE_STORAGE_WIDGET_ID} ref={this.widgetRef}></div>
          {this.state.ready ? undefined : <Spinner />}
        </div>
      </Container>
    );
  }
}
