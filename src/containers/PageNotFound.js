import React, { PureComponent } from "react";
import Container from "../components/Container";
import Section from "../components/Section";

export default class PageNotFound extends PureComponent {
  render() {
    return (
      <Container>
        <Section text="Page not found!" subText="You broke me!"></Section>
      </Container>
    );
  }
}
