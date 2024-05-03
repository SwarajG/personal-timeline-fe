import React from 'react';
import { Button } from '@browserstack/design-stack';
import { twClassNames } from '@browserstack/utils';
import PropTypes from 'prop-types';

export const AllIssueTabs = ({ issueTabs, activeTab, onTabSelect }) => (
  <>
    <div>
      {issueTabs?.map(({ label, value }, index) => (
        <Button
          wrapperClassName={twClassNames(value, {
            'rounded-l-none border-l-0': index === 1,
            'border-r-none border-r-0': index === 0 && activeTab !== value,
            'border-l-1 border-brand-500': index === 1 && activeTab === value,
            'border-brand-500': activeTab === value,
            'rounded-r-none': index === 0
          })}
          colors="white"
          size="small"
          onClick={() => onTabSelect(value)}
        >
          {label}
        </Button>
      ))}
    </div>
  </>
);

AllIssueTabs.propTypes = {
  issueTabs: PropTypes.objectOf(PropTypes.any).isRequired,
  activeTab: PropTypes.string.isRequired,
  onTabSelect: PropTypes.func.isRequired
};
