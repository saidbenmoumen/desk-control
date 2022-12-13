import { faGithub } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { Desk } from 'renderer/components/Desk';
import { Shell } from 'renderer/components/Shell';

export const Home = () => {
  return (
    <Shell>
      <Desk />
    </Shell>
  );
};
