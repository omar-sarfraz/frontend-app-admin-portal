import React from 'react';
import PropTypes from 'prop-types';
import { Card, Image, Stack } from '@edx/paragon';
import { channelMapping } from '../../../utils';

const LMSCard = ({ LMSType, onClick }) => (
  <Card
    isClickable
    className="pb-4"
    onClick={() => onClick(LMSType)}
  >
    <Card.Header
      title={(
        <Stack direction="horizontal" gap={2} className="justify-content-center">
          <Image className="lms-icon" src={channelMapping[LMSType].icon} />
          <span>{channelMapping[LMSType].displayName}</span>
        </Stack>
      )}
    />
  </Card>
);

LMSCard.propTypes = {
  LMSType: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
};
export default LMSCard;