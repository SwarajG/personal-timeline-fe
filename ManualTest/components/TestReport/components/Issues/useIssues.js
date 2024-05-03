import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  activeInitFilters,
  events,
  GUIDELINES,
  productType,
  TEST_TYPE
} from 'constants';
import {
  getIsPriorityBannerVisible,
  getShowBanner
} from 'features/Dashboard/slices/selectors';
import { setShowFreshChatButton } from 'features/Dashboard/slices/uiSlice';
import { getShareLinkCTAEventPayload } from 'features/ManualTest/helper';
import useFocus from 'hooks/useFocus';
import { getIsPublicReport } from 'utils';
import { getEnvUrl } from 'utils/envUtils';
import {
  deleteUrlQueryParam,
  tagToView,
  updateUrlWithQueryParam
} from 'utils/helper';
import { logEvent } from 'utils/logEvent';

import {
  resetFilters,
  resetIssueItem,
  setActiveComponentId,
  setActiveIssueIndex,
  setActiveSwitch,
  setActiveViolationId,
  setIsShowingIssue,
  setOpenAccordionId,
  setReportFilters,
  setResetFilterKey,
  setShowHiddenIssues
} from '../../slice/appSlice';
import {
  getActiveComponentId,
  getActiveIssueIndex,
  getActiveSwitch,
  getActiveViolationId,
  getCustomData,
  getIsShowingIssue,
  getReportData,
  getReportFilters,
  getReportMetaData,
  getShowHiddenIssuesState,
  getUniqFilterValues
} from '../../slice/selector';

const onGuidelineMode = (data, customData) => {
  if (!data || !customData) return [];

  const uniqTags = [];
  const finalTags = [];
  data.forEach((violation) => {
    violation.tags.forEach((tag) => {
      if (!finalTags.includes(tag)) {
        finalTags.push(tag);
      }
    });
  });
  data.forEach((violation) => {
    const { nodes, tags } = violation;
    const filteredTags = violation.tags.filter(
      (tag) =>
        !tag.includes('cat') &&
        tag.includes('wcag') &&
        !tag.includes('wcag21a') &&
        !tag.includes('wcag2a')
    );
    filteredTags.forEach((tag) => {
      const isTagExists = uniqTags.find(({ id }) => id === tag);
      if (!isTagExists && customData[tag]) {
        uniqTags.push({
          id: tag,
          actualId: violation.id, // this is needed when experimental rules are present. We need to redirect them to browserstack docs and not w3 docs
          value: customData[tag].value,
          help: `${customData[tag].value} ${customData[tag].name}`,
          name: customData[tag].name,
          description: customData[tag].description,
          tags,
          impact: '',
          issueCount: nodes.length,
          nodes
        });
        return;
      }
      uniqTags.forEach((violationItem, idx) => {
        if (violationItem.id === tag) {
          uniqTags[idx] = {
            ...violationItem,
            nodes: [...violationItem.nodes, ...nodes]
          };
        }
      });
    });
  });
  const sortedTagVersion = uniqTags
    .map((a) =>
      a.value
        .split('.')
        .map((n) => +n + 100000)
        .join('.')
    )
    .sort()
    .map((a) =>
      a
        .split('.')
        .map((n) => +n - 100000)
        .join('.')
    );
  // Map tags to sorted version
  return sortedTagVersion.map((version) =>
    uniqTags.find((tag) => tag.value === version)
  );
};

const filterReportData = (reportData, reportFilters, showHiddenIssues) => {
  let filteredViolations = reportData.map((violation) => ({
    ...violation,
    nodes: violation.nodes.filter(
      ({ confirmed }) => confirmed === null || confirmed
    )
  }));
  if (showHiddenIssues) {
    filteredViolations = reportData.map((violation) => {
      const filteredNodes = [];

      violation.nodes.forEach((node) => {
        node.childNodes.forEach((item) => {
          if (item.hidden) {
            filteredNodes.push(node);
          }
        });
      });

      return {
        ...violation,
        nodes: filteredNodes
      };
    });
  }
  if (reportFilters.showNeedsReviewIssues) {
    filteredViolations = reportData.map((violation) => ({
      ...violation,
      nodes: violation.nodes.filter(({ confirmed }) => confirmed === null)
    }));
  }
  if (reportFilters.impact.length) {
    const appliedSeverityFilter = reportFilters.impact.map(
      ({ value }) => value
    );
    filteredViolations = reportData.filter((violation) =>
      appliedSeverityFilter.includes(violation.impact)
    );
  }
  if (reportFilters.category.length) {
    filteredViolations = filteredViolations.filter(({ tags }) => {
      const category = tags
        .find((tag) => tag.includes('cat.'))
        ?.split('cat.')[1];
      return reportFilters.category
        .map(({ value }) => value)
        .includes(category);
    });
  }
  if (reportFilters.page.length) {
    filteredViolations = filteredViolations.map((violation) => ({
      ...violation,
      nodes: violation.nodes.filter(({ page }) =>
        reportFilters.page.map(({ value }) => value).includes(page.url)
      )
    }));
  }
  if (reportFilters.component.length) {
    filteredViolations = filteredViolations.map((violation) => ({
      ...violation,
      nodes: violation.nodes.filter(({ componentId }) =>
        reportFilters.component.map(({ value }) => value).includes(componentId)
      )
    }));
  }

  return filteredViolations
    .map((violation) => ({
      ...violation,
      issueCount: violation.nodes.length
    }))
    .filter(({ nodes }) => nodes.length);
};

const getActiveComponentList = (violation, activeComponentId) => {
  if (!violation) return [];
  const { nodes } = violation;
  const componentMap = {};

  nodes.forEach((node) => {
    if (!componentMap[node.componentId]) {
      componentMap[node.componentId] = [];
    }
    componentMap[node.componentId].push(node);
  });

  let tableData = Object.keys(componentMap).map((key) => {
    const uniqUrls = [];
    componentMap[key].forEach(({ page: { url } }) => {
      if (!uniqUrls.includes(url)) {
        uniqUrls.push(url);
      }
    });
    return {
      id: key,
      isActive: key === activeComponentId,
      componentId: key,
      pageCount: uniqUrls.length,
      issueCount: componentMap[key].length,
      count: componentMap[key].length
    };
  });

  tableData = tableData.sort((a, b) => b.count - a.count);

  return tableData;
};

export default function useIssues() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const activeSwitch = useSelector(getActiveSwitch);
  const activeComponentId = useSelector(getActiveComponentId);
  const activeViolationId = useSelector(getActiveViolationId);
  const activeIssueIndex = useSelector(getActiveIssueIndex);
  const reportData = useSelector(getReportData);
  const reportMetaData = useSelector(getReportMetaData);
  const customData = useSelector(getCustomData);
  const reportFilters = useSelector(getReportFilters);
  const showBanner = useSelector(getShowBanner);
  const showPriorityBanner = useSelector(getIsPriorityBannerVisible);
  const isShowingIssue = useSelector(getIsShowingIssue);
  const showHiddenIssues = useSelector(getShowHiddenIssuesState);
  const { urls, componentIds, categories } = useSelector(getUniqFilterValues);
  const isPublicReport = getIsPublicReport();
  const { containerRef: issueDetailsContainerRef, focusContainer } = useFocus();

  const isGuidelineMode = activeSwitch === GUIDELINES;

  const [filteredReportData, setFilteredReportData] = useState([]);
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);

  const { engineInfo } =
    reportMetaData?.meta[Object.keys(reportMetaData.meta)[0]];

  const activeViolation = useMemo(() => {
    if (!activeViolationId || !filterReportData.length) return null;
    return filteredReportData.find(({ id }) => id === activeViolationId);
  }, [activeViolationId, filteredReportData]);

  const activeComponentNodes = useMemo(() => {
    if (!activeComponentId || !activeViolation) return [];
    let activeViolationCopy = { ...activeViolation };
    const issueIds = new Set();
    const filteredNodes = [];

    activeViolation.nodes.forEach((node) => {
      node.childNodes.forEach((item) => {
        if (issueIds.has(node.issueId)) return;

        if (
          (showHiddenIssues && item.hidden) ||
          (!showHiddenIssues &&
            reportFilters.showNeedsReviewIssues &&
            item.confirmed === null) ||
          (!showHiddenIssues && !reportFilters.showNeedsReviewIssues) ||
          item.confirmed ||
          item.confirmed === null
        ) {
          filteredNodes.push(node);
          node.childNodes.forEach(({ issueId }) => {
            issueIds.add(issueId);
          });
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
  }, [
    activeComponentId,
    activeViolation,
    reportFilters.showNeedsReviewIssues,
    showHiddenIssues
  ]);

  const activeIssueItem = activeComponentNodes[activeIssueIndex];

  const appliedFilters = {
    severity: reportFilters.impact,
    pages: reportFilters.page,
    components: reportFilters.component,
    categories: reportFilters.category,
    showNeedsReviewIssues: reportFilters.showNeedsReviewIssues
  };
  const filterOptions = {
    pages: urls.map(({ value }) => value),
    components: componentIds.map(({ value }) => value),
    categories: categories.map(({ value }) => value)
  };
  const hasFilters =
    reportFilters.showNeedsReviewIssues ||
    Object.values(reportFilters).filter((item) => item.length > 0).length > 0;
  const showEmptyScreen = filteredReportData.every(
    ({ nodes }) => nodes?.length === 0
  );

  // In case of public reports, we dont add wcag version to params hence picking it up from metadata
  const getWcagVersion = () => {
    const params = new URLSearchParams(window.location.search);
    const type = params.get('type');

    if (isPublicReport) {
      // for assisted test 2.1A is hardcoded.
      if (type === productType.assistedTest) {
        return '2.1';
      }
      return reportMetaData?.meta[
        Object.keys(reportMetaData.meta)[0]
      ].wcagVersion.label.split(' ')[1];
    }

    return params.get('wcagVersion');
  };

  const toggleFilterModal = () => setIsFilterModalVisible((prev) => !prev);

  const getIssueHeight = () => {
    if (hasFilters) {
      if (showBanner || showPriorityBanner) {
        return 'calc(100vh - 416px)';
      }
      return 'calc(100vh - 352px)';
    }
    if (showBanner || showPriorityBanner) {
      return 'calc(100vh - 356px)';
    }
    return 'calc(100vh - 304px)';
  };

  const onTabSelect = (tabValue) => {
    dispatch(setActiveSwitch(tabValue));
    dispatch(setOpenAccordionId(''));
    logEvent('OnADReportView', {
      actionType: events.allIssuesTab,
      tab: tabValue
    });
    const path = deleteUrlQueryParam([
      'activeViolationId',
      'activeComponentId',
      'activeIssueIndex',
      'isShowingIssue'
    ]);

    const updatedPath = updateUrlWithQueryParam(
      {
        activeSwitch: tabValue
      },
      path
    );
    navigate({ search: updatedPath });
  };

  const onClickViolation = (violationId) => {
    dispatch(setActiveViolationId(violationId));
    dispatch(setIsShowingIssue(false));
    const path = deleteUrlQueryParam([
      'activeComponentId',
      'isShowingIssue',
      'activeIssueIndex'
    ]);
    navigate({
      search: updateUrlWithQueryParam(
        {
          activeViolationId: violationId
        },
        path
      )
    });
  };

  const onComponentClick = (selectedComponentId) => {
    dispatch(setActiveComponentId(selectedComponentId));
    dispatch(setIsShowingIssue(true));
    dispatch(setShowFreshChatButton(false));
    focusContainer();
    const path = updateUrlWithQueryParam({
      activeComponentId: selectedComponentId,
      isShowingIssue: true,
      activeIssueIndex: 0
    });
    navigate({ search: path });
  };

  const onHiddenIssueClick = (hideIssues) => {
    dispatch(resetIssueItem());
    dispatch(setShowHiddenIssues({ hideIssues }));
    const path = updateUrlWithQueryParam({ hideIssues });
    navigate({ search: path });
  };

  const updateFilters = (filtersToApply) => {
    const filter = {
      impact: filtersToApply.severity,
      page: filtersToApply.pages,
      component: filtersToApply.components,
      category: filtersToApply.categories,
      showNeedsReviewIssues: filtersToApply.showNeedsReviewIssues
    };
    dispatch(setReportFilters(filter));
    dispatch(resetIssueItem());
    const path = deleteUrlQueryParam([
      'activeViolationId',
      'activeComponentId',
      'activeIssueIndex',
      'isShowingIssue'
    ]);

    // update query params with applied filters
    const filterValues = {};
    Object.entries(filter).forEach(([key, values]) => {
      if (key !== 'showNeedsReviewIssues' && values.length > 0) {
        filterValues[key] = values.map(({ value }) => value);
      }
    });

    const updatedPath = updateUrlWithQueryParam(filterValues, path);
    navigate({ search: updatedPath });
  };

  const onUpdateImpact = (impactFilter) => {
    updateFilters({
      ...appliedFilters,
      severity: impactFilter
    });
  };

  const onSubmitFilters = (filtersToApply) => {
    updateFilters(filtersToApply);
    setIsFilterModalVisible(false);
  };

  const onTagClose = (filterToRemove) => {
    if (filterToRemove === 'all') {
      dispatch(resetFilters());
      const path = deleteUrlQueryParam(Object.keys(activeInitFilters));
      navigate({ search: path });
      return;
    }

    const keyMap = {
      severity: 'impact',
      pages: 'page',
      components: 'component',
      categories: 'category',
      showNeedsReviewIssues: 'showNeedsReviewIssues'
    };

    const path = deleteUrlQueryParam([keyMap[filterToRemove]]);
    dispatch(
      setResetFilterKey({
        key: keyMap[filterToRemove],
        value: filterToRemove === 'showNeedsReviewIssues' ? false : []
      })
    );

    navigate({ search: path });
  };

  const onIssueClose = () => {
    dispatch(setIsShowingIssue(false));
    dispatch(setShowFreshChatButton(true));
    navigate({
      search: deleteUrlQueryParam([
        'activeIssueIndex',
        'isShowingIssue',
        'activeComponentId'
      ])
    });
  };

  const onChangeIssueIndex = (index) => {
    const newIndex = index - 1;
    dispatch(setActiveIssueIndex(newIndex));
    const path = updateUrlWithQueryParam({ activeIssueIndex: newIndex });
    navigate({ search: path });
  };

  const getNodeNeedsReviewStatusInReports = (selectedIssueItem = {}) => {
    const { childNodes = [], testType } = selectedIssueItem;
    const isConsolidatedReport = Object.values(reportMetaData.meta).length > 1;

    const results = [];

    if (!childNodes.length || !isConsolidatedReport) return results;

    childNodes.forEach((item) => {
      const currentReportMeta =
        reportMetaData.meta[`${testType}:${item.reportId}`];
      if (showHiddenIssues) {
        if (item.hidden) {
          results.push({
            id: `${testType}:${currentReportMeta?.reportId || item.reportId}`,
            reportName: currentReportMeta.name,
            confirmed: false
          });
        }
      } else if (reportFilters.showNeedsReviewIssues) {
        if (item.confirmed === null) {
          results.push({
            id: `${testType}:${currentReportMeta?.reportId || item.reportId}`,
            reportName: currentReportMeta.name,
            confirmed: item.confirmed
          });
        }
      } else {
        results.push({
          id: `${testType}:${currentReportMeta?.reportId || item.reportId}`,
          reportName: currentReportMeta.name,
          confirmed: item.confirmed
        });
      }
    });

    return results;
  };

  const getUrlWithEngineInfo = (name, version, id, testType) => {
    const versionForURL = version.match(/^\d+\.\d+/)[0]; // extract major.minor version
    const nameForURL =
      testType === TEST_TYPE.ASSITIVE_TEST
        ? name
        : name.replace(/a11y_engine/g, 'a11y-engine'); // change a11y_engine to a11y-engine
    return `${getEnvUrl()}/more-info/${nameForURL}-${versionForURL}/${id}`;
  };

  const onClickLearnMore = (e, isExperimental = false) => {
    e.preventDefault();
    const { testType } = activeIssueItem;

    const tagList = tagToView(
      activeViolation?.tags.filter((tag) => tag === activeViolation.id)
    );

    let url = '';
    const { name, version } = engineInfo.testEngine;
    if (isGuidelineMode) {
      if (isExperimental) {
        url = getUrlWithEngineInfo(
          name,
          version,
          activeViolation.actualId,
          testType
        );
        window.open(url, '_blank');
        return;
      }
      url = window.open(
        customData[tagList[0].value].urls[getWcagVersion()],
        '_blank'
      );
    } else if (
      engineInfo &&
      engineInfo.testEngine &&
      Object.keys(engineInfo.testEngine).length > 1
    ) {
      url = getUrlWithEngineInfo(name, version, activeViolation.id, testType);
    } else {
      url = `${getEnvUrl()}/more-info/4.4/${activeViolation.id}`;
    }

    window.open(url, '_blank');
  };
  const extraEventPayload = () => {
    const isConsolidatedReport =
      new Set(Object.keys(reportMetaData.meta)).size > 1;
    const isATReport = activeIssueItem.testType === TEST_TYPE.ASSITIVE_TEST;

    return getShareLinkCTAEventPayload(isConsolidatedReport, isATReport);
  };

  const onShareIssueClick = () => {
    logEvent('InteractedWithShareLinkCTA', extraEventPayload());
  };

  useEffect(() => {
    let data = filterReportData(reportData, reportFilters, showHiddenIssues);

    if (activeSwitch === GUIDELINES) data = onGuidelineMode(data, customData);

    setFilteredReportData(data);
  }, [activeSwitch, customData, reportData, reportFilters, showHiddenIssues]);

  useEffect(() => {
    // If halfView
    if (activeComponentId && isShowingIssue && !!activeIssueItem)
      dispatch(setShowFreshChatButton(true));
  }, [activeComponentId, activeIssueItem, dispatch, isShowingIssue]);

  return {
    activeSwitch,
    onTabSelect,
    showEmptyScreen,
    showHiddenIssues,
    appliedFilters,
    isFilterModalVisible,
    toggleFilterModal,
    hasFilters,
    getIssueHeight,
    isHalfView: activeComponentId && isShowingIssue && !!activeIssueItem,
    violations: filteredReportData,
    activeComponentId,
    isShowingIssue: isShowingIssue && !!activeIssueItem,
    activeViolationId,
    onClickViolation,
    onComponentClick,
    onUpdateImpact,
    onHiddenIssueClick,
    onTagClose,
    onSubmitFilters,
    filterOptions,
    selectedIssue: {
      ...activeIssueItem,
      ruleData: {
        id: activeViolation?.learnMoreLink ?? activeViolation?.id,
        help: activeViolation?.help,
        description: activeViolation?.description
      }
    },
    activeIssueIndex,
    totalIssueCount: activeComponentNodes?.length,
    onIssueClose,
    onChangeIssueIndex,
    wcagVersion: getWcagVersion(),
    customData,
    issueLink: window.location.href,
    activeComponentList: getActiveComponentList(
      activeViolation,
      activeComponentId
    ),
    issueDetailsContainerRef,
    activeViolation,
    isGuidelineMode,
    nodeNeedsReviewStatusInReports:
      getNodeNeedsReviewStatusInReports(activeIssueItem),
    onClickLearnMore,
    onShareIssueClick,
    extraEventPayload,
    isConsolidatedReport:
      reportMetaData &&
      reportMetaData?.meta &&
      Object.values(reportMetaData?.meta).length > 1,
    engineInfo: engineInfo.testEngine
  };
}
