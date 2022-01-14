import React, { PureComponent, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { InformationCircleIcon } from "@heroicons/react/outline";
import Section from "./Section";
import preval from "preval.macro";
import Container from "./Container";

// Should probably be a build var but fuck itttttt
const DISCORD_INVITE = "https://discord.gg/SavdUC45MS";

// We'll throw these up here since they're replaced at build time anyway
const CHANGELOG_KEY = "changelog";
const CHANGELOG_SERIES = JSON.parse(preval`
const gitlog = require("gitlog").default;
const gitlogOptions = {
  repo: __dirname,
  number: 5,
  fields: ["abbrevHash", "authorDate", "authorName", "subject"],
};
module.exports = JSON.stringify(gitlog(gitlogOptions))
`);
export default class InfoModal extends PureComponent {
  state = {
    isOpen: false,
    changeAvailable: false,
  };

  setIsOpen = (open) => {
    return () => {
      localStorage.setItem(CHANGELOG_KEY, CHANGELOG_SERIES[0].abbrevHash);
      this.setState({ isOpen: open, changeAvailable: false });
    };
  };

  componentDidMount = () => {
    const lastItem = localStorage.getItem(CHANGELOG_KEY);
    if (!lastItem || lastItem !== CHANGELOG_SERIES[0].abbrevHash) {
      this.setState({
        changeAvailable: true,
      });
    }
  };

  render() {
    return (
      <button
        className="p-1 relative rounded-full bg-transparent text-black hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white focus:outline-none"
        onClick={this.setIsOpen(true)}
      >
        {this.state.changeAvailable ? (
          <Fragment>
            <span className="animate-ping absolute top-0 right-0 inline-block w-2 h-2 bg-red-500 dark:bg-red-600 rounded-full"></span>
            <span className="absolute top-0 right-0 inline-block w-2 h-2 bg-red-500 dark:bg-red-600 rounded-full"></span>
          </Fragment>
        ) : undefined}
        <InformationCircleIcon className="h-6 w-6" aria-hidden="true" />

        <Transition appear show={this.state.isOpen} as={Fragment}>
          <Dialog
            open={this.state.isOpen ? true : false}
            onClose={this.setIsOpen(false)}
            as="div"
            className="fixed inset-0 z-10 overflow-y-auto"
          >
            <div className="min-h-screen px-4 text-center">
              <Dialog.Overlay className="fixed inset-0" />
              <span
                className="inline-block h-screen align-middle"
                aria-hidden="true"
              >
                &#8203;
              </span>
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <div className="text-black dark:text-white inline-block bg-gray-100 dark:bg-gray-800 w-full max-w-lg p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
                  {/* Ugly wrapper thing for now I guess? */}
                  <div className="-mt-2">
                    <Section text="About" />
                    <Container>
                      <Dialog.Description>
                        While this project is related to{" "}
                        <a
                          className="text-blue-500 hover:text-blue-600"
                          href="https://cubari.moe/"
                        >
                          cubari.moe
                        </a>
                        , it should be considered distinct (and will evolve
                        independently of the main website).
                        <br></br>
                        Sources that have decent readers and/or no ads may be
                        included.
                      </Dialog.Description>
                    </Container>
                    <Section text="Credits" />
                    <Container>
                      <Dialog.Description>
                        All sources are powered by Paperback's extensions.{" "}
                        <a
                          className="text-blue-500 hover:text-blue-600"
                          href="https://paperback.moe/"
                        >
                          Check out the app if you're on iOS.
                        </a>
                      </Dialog.Description>
                    </Container>
                    <Section text="Discord" />
                    <Container>
                      <Dialog.Description>
                        Got suggestions? Either send us a message through the
                        chat icon or{" "}
                        <a
                          className="text-blue-500 hover:text-blue-600"
                          href={DISCORD_INVITE}
                        >
                          join our Discord.
                        </a>
                      </Dialog.Description>
                    </Container>
                    <Section text="Changelog" />
                    <Container>
                      <Dialog.Description>
                        {CHANGELOG_SERIES.map((changelog) => (
                          <span className="block" key={changelog.abbrevHash}>
                            <span className="text-red-400">
                              (<code>{changelog.abbrevHash}</code>)
                            </span>{" "}
                            {changelog.subject}
                          </span>
                        ))}
                      </Dialog.Description>
                    </Container>
                  </div>
                  <button
                    className="mt-10 bg-transparent text-black hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white block px-3 py-2 rounded-md text-base font-medium"
                    onClick={this.setIsOpen(false)}
                  >
                    Cool
                  </button>
                </div>
              </Transition.Child>
            </div>
          </Dialog>
        </Transition>
      </button>
    );
  }
}
