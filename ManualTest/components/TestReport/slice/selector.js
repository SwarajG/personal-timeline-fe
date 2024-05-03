import { createSelector } from '@reduxjs/toolkit';
import { formatComponentIdString } from 'utils/helper';

// app selector
export const getShowHiddenIssuesState = (state) =>
  state.accessibility.app.report.showHiddenIssues.hideIssues;
export const getActiveViolationId = (state) =>
  state.accessibility.app.report.activeViolationId;
export const getActiveComponentId = (state) =>
  state.accessibility.app.report.activeComponentId;
export const getActiveIssueIndex = (state) =>
  state.accessibility.app.report.activeIssueIndex;
export const getIsShowingIssue = (state) =>
  state.accessibility.app.report.isShowingIssue;
export const getIsActiveOpen = (state) =>
  state.accessibility.app.report.isActiveOpen;
export const getActiveTab = (state) => state.accessibility.app.report.activeTab;
export const getActiveSwitch = (state) =>
  state.accessibility.app.report.activeSwitch;
export const getDefaultIndex = (state) =>
  state.accessibility.app.report.defaultIndex;
export const getOpenAccordionId = (state) =>
  state.accessibility.app.report.openAccordionId;
export const getReportFilters = (state) =>
  state.accessibility.app.report.activeFilters;
export const getIntermediateFilters = (state) =>
  state.accessibility.app.report.intermediateFilters;

// data selector
export const getReportData = (state) =>
  state.accessibility.data.report.reportData;
export const getReportMetaData = (state) =>
  state.accessibility.data.report.reportMetaData;
export const getCustomData = (state) =>
  state.accessibility.data.report.customData;

export const getUniqFilterValues = createSelector(
  getReportData,
  (reportData) => {
    const urls = [];
    const componentIds = [];
    const categories = [];
    reportData.forEach((violation) => {
      const category = violation.tags
        .find((tag) => tag.includes('cat.'))
        ?.split('cat.')[1];
      const categoryList = categories.map(({ label }) => label);
      if (!categoryList.includes(category)) {
        categories.push({
          label: category,
          value: category
        });
      }
      violation.nodes.forEach((node) => {
        const urlList = urls.map(({ value }) => value);
        const componentIdList = componentIds.map(({ value }) => value);
        if (!urlList.includes(node.page.url)) {
          urls.push({
            label: node.page.url,
            value: node.page.url
          });
        }
        if (!componentIdList.includes(node.componentId)) {
          componentIds.push({
            label: formatComponentIdString(node.componentId),
            value: node.componentId
          });
        }
      });
    });
    return { urls, componentIds, categories };
  }
);

// app + data selector
export const getActiveViolation = createSelector(
  getActiveViolationId,
  getReportData,
  (activeViolationId, reportData) => {
    if (activeViolationId) {
      return reportData.find(({ id }) => id === activeViolationId);
    }
    return null;
  }
);

export const getActiveComponentNodes = createSelector(
  getActiveViolation,
  getActiveComponentId,
  getShowHiddenIssuesState,
  getReportFilters,
  (activeViolation, activeComponentId, showHiddenIssues, activeFilters) => {
    if (!activeViolation) return [];

    let activeViolationCopy = activeViolation;
    const filteredNodes = [];

    activeViolation.nodes.forEach((node) => {
      node.childNodes.forEach((item) => {
        if (
          (showHiddenIssues && item.hidden) ||
          (!showHiddenIssues &&
            activeFilters.showNeedsReviewIssues &&
            item.confirmed === null) ||
          (!showHiddenIssues && !activeFilters.showNeedsReviewIssues) ||
          item.confirmed ||
          item.confirmed === null
        ) {
          filteredNodes.push(node);
        }
      });
    });

    activeViolationCopy = {
      ...activeViolationCopy,
      nodes: filteredNodes
    };

    return activeViolationCopy.nodes.filter(
      ({ componentId }) => componentId === activeComponentId
    );
  }
);

export const getIssueItem = createSelector(
  getActiveComponentNodes,
  getActiveIssueIndex,
  (activeComponentNodes, activeIssueIndex) => {
    if (
      activeComponentNodes &&
      activeIssueIndex > activeComponentNodes.length - 1 &&
      activeIssueIndex < 0
    ) {
      return 0;
    }
    return activeComponentNodes[activeIssueIndex];
  }
);
