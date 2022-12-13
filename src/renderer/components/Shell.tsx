import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog, faMinus, faX } from '@fortawesome/free-solid-svg-icons';
import { faGithub } from '@fortawesome/free-brands-svg-icons';
export const Shell: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  return (
    <div className="bg-neutral-800 min-h-screen flex flex-col rounded-lg overflow-hidden">
      <header className="px-5 py-3 flex justify-between items-center">
        <h1 className="text-white font-semibold text-xl">
          IDÅSEN control <small className="font-light">v0.0.1-alpha</small>
        </h1>
        <div className="">
          <button
            className="outline-none border-0 w-8 h-8  text-neutral-400 hover:text-white hover:bg-neutral-900 rounded"
            onClick={() => {
              alert('COG');
            }}
          >
            <FontAwesomeIcon icon={faCog} />
          </button>
          <button
            className="outline-none border-0 w-8 h-8  text-neutral-400 hover:text-white hover:bg-neutral-900 rounded"
            onClick={() => {}}
          >
            <FontAwesomeIcon icon={faMinus} />
          </button>
          <button
            className="outline-none border-0 w-8 h-8  text-neutral-400 hover:text-white hover:bg-neutral-900 rounded"
            onClick={() => {
              // console.log(window.electron)
            }}
          >
            <FontAwesomeIcon icon={faX} />
          </button>
        </div>
      </header>
      <main className="flex-1 flex flex-col">{children}</main>
      <footer className="flex p-5 justify-between text-white">
        <a
          href="https://github.com/saidbenmoumen/idasen-control"
          target="_blank"
        >
          <FontAwesomeIcon icon={faGithub} size="xl" />
        </a>
        <a href="https://github.com/saidbenmoumen" target="_blank">
          @saidbenmoumen
        </a>
      </footer>
    </div>
  );
};
