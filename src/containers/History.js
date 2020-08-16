import React, { PureComponent } from "react";

export default class History extends PureComponent {
  render() {
    return (
      <div className="columns is-multiline" id="latest-container">
        <section className="hero column is-full">
          <div className="hero-body">
            <div className="container">
              <h1 className="title">History</h1>
              <h2 className="subtitle">
                Would you like to see your history here? Let me know on Discord
                that you'd actually use this feature.
              </h2>
            </div>
          </div>
        </section>
      </div>
    );
  }
}
