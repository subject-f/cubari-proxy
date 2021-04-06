import React, { PureComponent } from "react";

export default class PageNotFound extends PureComponent {
  render() {
    return (
      <div className="columns is-mobile is-multiline">
        <section className="hero column is-full">
          <div className="hero-body">
            <div className="container">
              <h1 className="title">404</h1>
              <h2 className="subtitle">
                Go home? Or visit <a href="https://cubari.moe/">cubari.moe</a>.
              </h2>
            </div>
          </div>
        </section>
      </div>
    );
  }
}
