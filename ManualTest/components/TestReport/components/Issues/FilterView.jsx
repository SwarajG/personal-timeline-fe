import React from 'react';
import { Button, Tag } from '@browserstack/design-stack';
import PropTypes from 'prop-types';

export const FilterView = ({
  appliedFilters,
  onTagClose,
  showHiddenIssues,
  onHiddenIssueClick
}) => {
  const getKeyName = (key, values) => {
    const hasMultipleValues = values.length > 1;
    const obj = {
      categories: hasMultipleValues ? 'categories' : 'category',
      pages: hasMultipleValues ? 'pages' : 'page',
      components: hasMultipleValues ? 'components' : 'component',
      severity: hasMultipleValues ? 'severities' : 'severity',
      tags: hasMultipleValues ? 'tags' : 'tag',
      files: hasMultipleValues ? 'files' : 'file',
      tests: hasMultipleValues ? 'tests' : 'test'
    };
    return `${values?.length} ${obj[key]}`;
  };

  return (
    <div className="bg-base-100 px-6 py-3">
      {showHiddenIssues && (
        <Tag
          hasDismissButton
          isRounded
          size="large"
          modifier="white"
          onDismiss={() => onHiddenIssueClick(false)}
          text="Hidden issues"
          dismissLabel="Remove filter Hidden issues"
        />
      )}
      {!showHiddenIssues && (
        <div className="flex space-x-4">
          <p className="w-fit border-r border-base-300 pr-4 text-sm text-brand-600">
            Filters
          </p>
          {Object.entries(appliedFilters).map(([key, values]) =>
            key !== 'showNeedsReviewIssues' && values?.length ? (
              <Tag
                size="large"
                hasDismissButton
                text={getKeyName(key, values)}
                onDismiss={() => onTagClose(key)}
                modifier="white"
                dismissLabel={`Remove filter ${key}`}
              />
            ) : null
          )}
          {appliedFilters.showNeedsReviewIssues ? (
            <Tag
              hasDismissButton
              text="Needs review"
              size="large"
              modifier="white"
              onDismiss={() => onTagClose('showNeedsReviewIssues')}
              dismissLabel="Remove filter needs review"
            />
          ) : null}
          <Button
            onClick={() => onTagClose('all')}
            size="small"
            colors="white"
            variant="minimal"
          >
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
};

FilterView.propTypes = {
  appliedFilters: PropTypes.objectOf(PropTypes.any).isRequired,
  onTagClose: PropTypes.func.isRequired,
  onHiddenIssueClick: PropTypes.func.isRequired,
  showHiddenIssues: PropTypes.bool.isRequired
};
