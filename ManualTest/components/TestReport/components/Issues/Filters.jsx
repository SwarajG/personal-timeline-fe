import React from 'react';
import {
  Button,
  SelectMenu,
  SelectMenuOptionGroup,
  SelectMenuOptionItem,
  SelectMenuTrigger,
  Tooltip,
  TooltipBody
} from '@browserstack/design-stack';
import { MdFilterAlt, MdHideSource } from '@browserstack/design-stack-icons';
import AllIssueFilters from 'common/AllIssueFilter';
import PropTypes from 'prop-types';

export const Filters = ({
  severityOptions,
  isFilterModalVisible,
  toggleFilterModal,
  filtersData,
  appliedFilters,
  onSubmit,
  onUpdateImpact,
  showHiddenIssues,
  onHiddenIssueClick,
  hasFilters
}) => {
  const { severity } = appliedFilters;

  return (
    <div className="ml-auto flex space-x-4">
      <div className="w-36">
        <SelectMenu onChange={onUpdateImpact} value={severity} isMulti>
          <SelectMenuTrigger placeholder="Severity" />
          <SelectMenuOptionGroup>
            {severityOptions.map((item) => (
              <SelectMenuOptionItem
                key={item.value}
                option={item}
                wrapperClassName="text-sm font-semibold text-base-900"
              />
            ))}
          </SelectMenuOptionGroup>
        </SelectMenu>
      </div>
      {!showHiddenIssues && (
        <Tooltip
          theme="dark"
          placementSide="left"
          content={
            <TooltipBody wrapperClassName="mb-0">
              <span aria-hidden="true">View Filters</span>
            </TooltipBody>
          }
        >
          <Button
            icon={<MdFilterAlt className="text-xl" />}
            colors="white"
            size="small"
            onClick={toggleFilterModal}
            isIconOnlyButton
            aria-label="View Filters"
            wrapperClassName="h-full"
          />
        </Tooltip>
      )}

      {isFilterModalVisible && (
        <AllIssueFilters
          filtersData={filtersData}
          appliedFilters={appliedFilters}
          onCloseClick={toggleFilterModal}
          onSubmit={onSubmit}
        />
      )}

      {!showHiddenIssues && !hasFilters && (
        <Tooltip
          theme="dark"
          placementSide="left"
          content={
            <TooltipBody wrapperClassName="mb-0">
              <span aria-hidden="true">View Hidden issues</span>
            </TooltipBody>
          }
        >
          <Button
            colors="white"
            onClick={() => onHiddenIssueClick(true)}
            size="small"
            icon={<MdHideSource className="text-xl" />}
            isIconOnlyButton
            aria-label="View Hidden issues"
            wrapperClassName="h-full"
          />
        </Tooltip>
      )}
    </div>
  );
};

Filters.propTypes = {
  severityOptions: PropTypes.arrayOf(PropTypes.string).isRequired,
  isFilterModalVisible: PropTypes.bool.isRequired,
  toggleFilterModal: PropTypes.func.isRequired,
  filtersData: PropTypes.objectOf(PropTypes.any).isRequired,
  appliedFilters: PropTypes.objectOf(PropTypes.any).isRequired,
  onSubmit: PropTypes.func.isRequired,
  onUpdateImpact: PropTypes.func.isRequired,
  showHiddenIssues: PropTypes.bool.isRequired,
  onHiddenIssueClick: PropTypes.func.isRequired,
  hasFilters: PropTypes.bool.isRequired
};
