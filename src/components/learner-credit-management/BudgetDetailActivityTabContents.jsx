import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { useParams } from 'react-router-dom';

import LearnerCreditAllocationTable from './LearnerCreditAllocationTable';
import { useOfferRedemptions, isUUID } from './data';

const BudgetDetailActivityTabContents = ({
  enterpriseUUID,
  enterpriseSlug,
  enableLearnerPortal,
}) => {
  const { budgetId } = useParams();
  const enterpriseOfferId = isUUID(budgetId) ? null : budgetId;
  const subsidyAccessPolicyId = isUUID(budgetId) ? budgetId : null;
  const {
    isLoading: isLoadingOfferRedemptions,
    offerRedemptions,
    fetchOfferRedemptions,
  } = useOfferRedemptions(enterpriseUUID, enterpriseOfferId, subsidyAccessPolicyId);

  return (
    <LearnerCreditAllocationTable
      isLoading={isLoadingOfferRedemptions}
      tableData={offerRedemptions}
      fetchTableData={fetchOfferRedemptions}
      enterpriseUUID={enterpriseUUID}
      enterpriseSlug={enterpriseSlug}
      enableLearnerPortal={enableLearnerPortal}
    />
  );
};

const mapStateToProps = state => ({
  enterpriseUUID: state.portalConfiguration.enterpriseId,
  enterpriseSlug: state.portalConfiguration.enterpriseSlug,
  enableLearnerPortal: state.portalConfiguration.enableLearnerPortal,
});

BudgetDetailActivityTabContents.propTypes = {
  enterpriseUUID: PropTypes.string.isRequired,
  enterpriseSlug: PropTypes.string.isRequired,
  enableLearnerPortal: PropTypes.bool.isRequired,
};

export default connect(mapStateToProps)(BudgetDetailActivityTabContents);
