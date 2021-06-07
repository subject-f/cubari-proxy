import React, { PureComponent, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { InformationCircleIcon } from "@heroicons/react/outline";
import Section from "./Section";

export default class InfoModal extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      isOpen: false,
    };
  }

  setIsOpen = (open) => {
    return () => this.setState({ isOpen: open });
  };

  render() {
    return (
      <button
        className="p-1 rounded-full bg-transparent text-black hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white focus:outline-none"
        onClick={this.setIsOpen(true)}
      >
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
                <div className="text-black dark:text-white inline-block bg-gray-100 dark:bg-gray-800 w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
                  {/* Ugly wrapper thing for now I guess? */}
                  <div className="-mt-2">
                    <Section text="About" />
                    <Dialog.Description>
                      While this project is related to cubari.moe, it should be
                      considered distinct (and will evolve independently of the
                      main website).
                      <br></br>
                      <br></br>
                      Sources that have decent readers and/or no ads may be
                      included.
                    </Dialog.Description>
                    <Section text="Credits" />
                    <Dialog.Description>
                      All sources are powered by Paperback's extensions.{" "}
                      <a href="https://paperback.moe/">
                        Check out the app if you're on iOS.
                      </a>
                    </Dialog.Description>
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
