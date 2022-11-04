import React from 'react';
import { Card } from '@edx/paragon';
import PropTypes from 'prop-types';

const ZeroStateCardText = ({ textContainerClassName, children }) => (
  <Card.Section className={textContainerClassName}>
    {children}
  </Card.Section>
);

ZeroStateCardText.propTypes = {
  textContainerClassName: PropTypes.string,
  children: PropTypes.node.isRequired,
};

ZeroStateCardText.defaultProps = {
  textContainerClassName: 'text-center',
};

export default ZeroStateCardText;
