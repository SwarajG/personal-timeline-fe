import React from 'react';
import { Stats } from '@browserstack/design-stack';
import CategoryCard from 'common/CategoryCard';
import SummaryChart from 'common/SummaryChart';
import TableCard from 'common/TableCard';
import { events } from 'constants';
import { formatComponentIdString } from 'utils/helper';

import useSummary from './useSummary';

const ISSUES = 'Issues';

const urlColumns = [
  {
    id: 'index',
    name: '#',
    key: 'index'
  },
  {
    id: 'affectedUrls',
    name: 'Affected URLs',
    key: 'affectedUrls'
  },
  {
    id: 'issueCount',
    name: ISSUES,
    key: 'issueCount'
  }
];

const componentColumns = [
  {
    id: 'index',
    name: '#',
    key: 'index'
  },
  {
    id: 'affectedComponents',
    name: 'Affected components',
    key: 'affectedComponents'
  },
  {
    id: 'issueCount',
    name: ISSUES,
    key: 'issueCount'
  }
];

const categoryColumns = [
  {
    id: 'index',
    name: '#',
    key: 'index'
  },
  {
    id: 'category',
    name: 'Category',
    key: 'category'
  },
  {
    id: 'issueCount',
    name: ISSUES,
    key: 'issueCount'
  }
];

export default function Summary() {
  const {
    reportMetaData: { issueSummary, chartData },
    onRowClick,
    onHiddenIssueClick,
    getHiddenIssuesCount,
    getContainerHeight
  } = useSummary();

  const { hiddenIssues, needsReviewIssues } = getHiddenIssuesCount();
  const { issueCountByComponent, issueCountByURL, issueCountByCategory } =
    chartData;

  const {
    componentCount,
    issueCount,
    pageCount,
    minor,
    moderate,
    serious,
    critical
  } = issueSummary;

  const options = [
    {
      id: 1,
      name: 'Needs review issues',
      stat: needsReviewIssues,
      onClick: () => onRowClick('showNeedsReviewIssues', true, true)
    },
    {
      id: 2,
      name: 'Hidden issues',
      stat: hiddenIssues,
      onClick: onHiddenIssueClick
    }
  ];

  const categoryList = issueCountByCategory
    ?.map(({ category, count }) => ({
      label: category,
      value: category,
      count
    }))
    .sort((a, b) => b.count - a.count);

  const componentCountList = issueCountByComponent
    ?.map(({ componentId, count }) => ({
      label: formatComponentIdString(componentId),
      value: componentId,
      count
    }))
    .sort((a, b) => b.count - a.count);

  const urlCountList = issueCountByURL
    ?.map(({ url, count }) => ({
      label: url,
      value: url,
      count
    }))
    .sort((a, b) => b.count - a.count);

  const issueSummaryData = [
    {
      label: 'Critical',
      name: 'Critical',
      y: critical,
      color: '#F95D6A',
      selected: true,
      value: 'critical'
    },
    {
      label: 'Serious',
      name: 'Serious',
      y: serious,
      color: '#F472B6',
      value: 'serious'
    },
    {
      label: 'Moderate',
      name: 'Moderate',
      y: moderate,
      color: '#FBBF24',
      value: 'moderate'
    },
    {
      label: 'Minor',
      name: 'Minor',
      y: minor,
      color: '#9CA3AF',
      value: 'minor'
    }
  ];

  return (
    <div
      className="overflow-auto bg-base-50"
      style={{ height: getContainerHeight() }}
    >
      <div className="grid grid-cols-1 gap-4 p-6 lg:grid-cols-2">
        <SummaryChart
          title="Issue summary"
          chartTitle="ISSUES"
          totalCount={issueCount}
          summary={issueSummaryData}
          filterKey="impact"
          onRowClick={onRowClick}
          enableEvents
          eventName="OnADReportView"
          actionType={events.INTERACT_WITH_CHART}
          wrapperClassName="mt-2"
        />
        {componentCountList && (
          <TableCard
            title="Affected components"
            list={componentCountList}
            columns={componentColumns}
            onRowClick={onRowClick}
            wrapperClassName="mt-2"
            filterKey="component"
            listCount={componentCount}
          />
        )}
        <CategoryCard
          columns={categoryColumns}
          list={categoryList}
          issueCount={issueCount}
          wrapperClassName="mt-4 row-span-3"
          enableEvents
          eventName="OnADReportView"
          onRowClick={onRowClick}
          componentName="MANUAL"
        />
        {urlCountList && (
          <TableCard
            title="Affected pages"
            list={urlCountList}
            columns={urlColumns}
            filterKey="page"
            onRowClick={onRowClick}
            wrapperClassName="mt-4"
            listCount={pageCount}
          />
        )}
        <dl className="mt-4 flex">
          {options.map((option) => (
            <Stats
              key={option.id}
              option={option}
              cardWrapperClassname="w-2/4 mr-4"
            />
          ))}
        </dl>
      </div>
    </div>
  );
}
