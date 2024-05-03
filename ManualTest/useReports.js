import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getStorage, setStorage } from '@browserstack/utils';
import {
  deleteAssitiveScanReport,
  deleteWorkflowScanReport
} from 'api/deleteReport';
import fetchReports from 'api/fetchReports';
import {
  CREATED_AT_OPTIONS,
  events,
  IS_ALREADY_SHOWN_TOOLTIP_FOR_GET_A_DEMO_EXPERIMENT,
  IS_DOWNLOAD_MODAL_SHOWN_FOR_PRODUCT_GET_A_DEMO,
  IS_TOOLTIP_SHOWN_FOR_EXP_USERS,
  IS_USER_VISITED,
  REPORT_TYPE_OPTIONS,
  SLIDEOVER_KEYS,
  testTypes
} from 'constants';
import {
  setIsPaywallFreeOfferModalShowing,
  setToolkitOnLiveModal
} from 'features/Dashboard/slices/appSlice';
import {
  getIsPaywallFreeOfferModalShowing,
  getIsPriorityBannerVisible,
  getProductIntro,
  getShowBanner,
  getSidebarCollapsedStatus,
  getUser
} from 'features/Dashboard/slices/selectors';
import { setShowFreshChatButton } from 'features/Dashboard/slices/uiSlice';
import debounce from 'lodash/debounce';
import { updateUrlWithQueryParam } from 'utils/helper';
import { logEvent } from 'utils/logEvent';

import {
  resetReportSelection,
  setActiveVersion,
  setIsReportSelected,
  setReportList
} from './slices/appSlice';
import {
  getActiveVersion,
  getIsSelectionMode,
  getReportList
} from './slices/selector';

export default function useReports(notifyReportDeleted) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isPaywallFreeOfferModalShowing = useSelector(
    getIsPaywallFreeOfferModalShowing
  );
  const reportList = useSelector(getReportList);
  const activeVersion = useSelector(getActiveVersion);
  const isSidebarCollapsed = useSelector(getSidebarCollapsedStatus);
  const productIntroModal = useSelector(getProductIntro);
  const { isExperimentUser, isShowingIntroDemo } = productIntroModal;
  const selectedReportsLength = reportList.filter(
    (report) => report.isSelected
  ).length;
  const isMergeDisabled = selectedReportsLength < 2;
  const alreadyVisited = getStorage(IS_USER_VISITED);
  const isDownloadModalShownForDemoCall = getStorage(
    IS_DOWNLOAD_MODAL_SHOWN_FOR_PRODUCT_GET_A_DEMO
  );
  const [isOpen, setIsOpen] = useState(
    !alreadyVisited || (!isDownloadModalShownForDemoCall && isShowingIntroDemo)
  );
  const [searchInput, setSearchInput] = useState('');
  const showBanner = useSelector(getShowBanner);
  const [isLoading, setIsLoading] = useState(false);
  const [showColdStart, setShowColdStart] = useState(false);
  const [showExtButtonTooltip, setShowExtButtonTooltip] = useState(false);
  const shownTooltipForExperimentUser = getStorage(
    IS_TOOLTIP_SHOWN_FOR_EXP_USERS
  );
  const isAlreadyShownTooltipForGetADemoExperiment = getStorage(
    IS_ALREADY_SHOWN_TOOLTIP_FOR_GET_A_DEMO_EXPERIMENT
  );
  const showPriorityBanner = useSelector(getIsPriorityBannerVisible);
  const isSelectionMode = useSelector(getIsSelectionMode);
  const [showFilterSlideover, setShowFilterSlideover] = useState(false);
  const [reportListCopy, setReportListCopy] = useState([]);
  const [filters, setFilters] = useState();
  const [appliedFilters, setAppliedFilters] = useState({});
  const [showDeleteScanModal, setShowDeleteScanModal] = useState(false);
  const [activeRowId, setActiveRowId] = useState();
  const {
    plan_type: typeOfPlan,
    eft_type: eftType,
    user_id: userId,
    udac,
    plan,
    toolkit_on_live: toolkitOnLive
  } = useSelector(getUser);
  const columns = [
    {
      name: 'Report',
      key: 'report'
    },
    {
      name: 'Type',
      key: 'scanType'
    },
    {
      name: 'Summary',
      key: 'summary'
    },
    {
      name: 'Severity',
      key: 'severity'
    },
    {
      name: '',
      key: 'menu'
    }
  ];

  const handleNewTestClick = () => {
    dispatch(
      setToolkitOnLiveModal({
        show: true,
        source: 'Manual test reports top right'
      })
    );
    logEvent('OnLaunchExtensionBrowserSelectionView', {
      source: 'Manual test reports top right'
    });
  };

  const onReportClick = (e, report) => {
    const { uniqueId: id, isSelected } = report;
    if (e?.target?.type === 'checkbox') {
      return;
    }
    if (isSelectionMode) {
      dispatch(setIsReportSelected({ id, isSelected: !isSelected }));
    } else {
      logEvent('InteractedWithADHomepage', {
        actionType: 'View individual report'
      });
      const params = {
        wcagVersion: activeVersion.split('WCAG ')[1]
      };
      const [, ids] = id.split(':');
      if (id.includes(testTypes.workflowScan)) {
        params.ids = ids;
      }
      if (id.includes(testTypes.assistiveTest)) {
        params.ar_ids = ids;
      }
      if (id.includes(testTypes.websiteScan)) {
        params.wsr_ids = ids;
      }
      const path = updateUrlWithQueryParam(params);
      navigate(`report?${path}`);
    }
  };

  const handleClose = ({ action }) => {
    setIsOpen(false);
    setStorage(IS_USER_VISITED, true);
    setStorage(IS_DOWNLOAD_MODAL_SHOWN_FOR_PRODUCT_GET_A_DEMO, true);

    if (action === 'cross-click') {
      logEvent('InteractedWithADExtensionDownloadModal', {
        actionType: events.CROSS_BUTTON
      });
    } else if (action === 'do-later') {
      logEvent('InteractedWithADExtensionDownloadModal', {
        actionType: events.CLOSE_MODAL
      });
      // on showing tooltip
      if (reportList.length > 0) {
        logEvent('OnManualTestReportsDownloadExtensionTooltip');
      }
      setShowExtButtonTooltip(true);
    } else if (action === 'download-extension') {
      logEvent('InteractedWithADExtensionDownloadModal', {
        actionType: events.DOWNLOAD_EXTENSION
      });
    }
  };

  const handleOpenFilterSlideover = () => {
    setShowFilterSlideover(true);
  };

  const handleCloseFilterSlideover = () => {
    setShowFilterSlideover(false);
  };

  const removeAllFilter = () => {
    setSearchInput('');
    setAppliedFilters({});
    setReportListCopy(reportList);
  };

  const onVersionSelect = (id) => {
    if (id !== activeVersion) {
      dispatch(setActiveVersion(id));
      logEvent('InteractedWithADHomepage', {
        actionType: events.SELECT_TAB,
        tabName: id
      });
    }
  };

  const resetSelection = () => {
    dispatch(resetReportSelection());
    logEvent('InteractedWithADHomepage', {
      actionType: events.CANCEL_SELECTION
    });
  };

  const onReportConsolidateButtonClick = () => {
    const selectedReports = reportList
      .filter((report) => report.isSelected)
      .map(({ uniqueId }) => uniqueId);
    const workflowScanList = selectedReports
      .filter((id) => id.includes(testTypes.workflowScan))
      .map((id) => id.split(`${testTypes.workflowScan}:`)[1]);
    const assistiveTestList = selectedReports
      .filter((id) => id.includes(testTypes.assistiveTest))
      .map((id) => id.split(`${testTypes.assistiveTest}:`)[1]);
    const websiteScanList = selectedReports
      .filter((id) => id.includes(testTypes.websiteScan))
      .map((id) => id.split(`${testTypes.websiteScan}:`)[1]);

    const params = {
      wcagVersion: activeVersion.split('WCAG ')[1]
    };
    if (workflowScanList.length) {
      params.ids = workflowScanList.join(',');
    }
    if (assistiveTestList.length) {
      params.ar_ids = assistiveTestList.join(',');
    }
    if (websiteScanList.length) {
      params.wsr_ids = websiteScanList.join(',');
    }
    const path = updateUrlWithQueryParam(params);
    logEvent('InteractedWithADHomepage', {
      actionType: 'View consolidated report',
      reportCount: selectedReportsLength
    });
    navigate(`report?${path}`);
  };

  const onInputValueChange = debounce((e) => {
    setSearchInput(e.target.value);
  }, 250);

  const onGrowthModalClose = (value) => {
    dispatch(setIsPaywallFreeOfferModalShowing(value));
    setShowExtButtonTooltip(true);
  };

  const getPayload = useCallback(() => {
    const payload = {};
    if (eftType) {
      payload.currentPlan = 'Trial';
      payload.trialType = eftType === 'eft' ? 'EFT' : 'RT';
    } else {
      payload.currentPlan = typeOfPlan === 'free' ? 'Freemium' : 'Paid';
    }
    payload.planType = plan === 'enterprise' ? 'Enterprise' : 'Free';
    payload.dataAccess = udac === 'global' ? 'Global' : 'Team';
    return payload;
  }, [eftType, plan, typeOfPlan, udac]);

  useEffect(() => {
    const eventPayload = getPayload();
    if (!alreadyVisited) {
      logEvent('OnADHomepage', {
        firstVisit: true,
        ...eventPayload
      });
    } else {
      logEvent('OnADHomepage', {
        firstVisit: false,
        ...eventPayload
      });
    }
    if (!alreadyVisited && !isExperimentUser) {
      logEvent('OnADExtensionDownloadModal', {});
    }
  }, [
    alreadyVisited,
    eftType,
    getPayload,
    isExperimentUser,
    plan,
    typeOfPlan,
    udac
  ]);

  const refetchReportsOnDelete = () => {
    fetchReports().then((response) => {
      setIsLoading(false);
      setFilters({
        [SLIDEOVER_KEYS.CREATED_AT]: CREATED_AT_OPTIONS,
        [SLIDEOVER_KEYS.TYPE]: REPORT_TYPE_OPTIONS,
        ...response.filters
      });
      const updatedResponse = response.reports.map((report) => ({
        ...report,
        isSelected: false
      }));
      setReportListCopy(updatedResponse);
      dispatch(setReportList(updatedResponse));
      setSearchInput('');
      setAppliedFilters({});
      setShowDeleteScanModal(false);
      notifyReportDeleted();
    });
  };

  const handleDeleteReport = () => {
    setIsLoading(true);
    logEvent('InteractedWithDeletionModal', {
      tool: 'Manual test reports',
      action: 'Delete report',
      source: 'Listing'
    });
    if (activeRowId.testType === 'workflowScan') {
      deleteWorkflowScanReport(activeRowId.id).then(() => {
        refetchReportsOnDelete();
      });
    } else if (activeRowId.testType === 'assistiveTest') {
      deleteAssitiveScanReport(activeRowId.id).then(() => {
        refetchReportsOnDelete();
      });
    }
  };

  useEffect(() => {
    if (!isOpen && !shownTooltipForExperimentUser && isExperimentUser) {
      setShowExtButtonTooltip(true);
      setStorage(IS_TOOLTIP_SHOWN_FOR_EXP_USERS, true);
    }
  }, [shownTooltipForExperimentUser, isExperimentUser, isOpen]);

  useEffect(() => {
    if (
      !isOpen &&
      !isAlreadyShownTooltipForGetADemoExperiment &&
      isDownloadModalShownForDemoCall &&
      isShowingIntroDemo
    ) {
      setShowExtButtonTooltip(true);
      setStorage(IS_ALREADY_SHOWN_TOOLTIP_FOR_GET_A_DEMO_EXPERIMENT, true);
    }
  }, [
    isOpen,
    isAlreadyShownTooltipForGetADemoExperiment,
    isDownloadModalShownForDemoCall,
    isShowingIntroDemo
  ]);

  useEffect(() => {
    setIsLoading(true);
    fetchReports().then((response) => {
      setIsLoading(false);
      setFilters({
        [SLIDEOVER_KEYS.CREATED_AT]: CREATED_AT_OPTIONS,
        [SLIDEOVER_KEYS.TYPE]: REPORT_TYPE_OPTIONS,
        ...response.filters
      });
      const updatedResponse = response.reports.map((report) => ({
        ...report,
        isSelected: false
      }));
      setReportListCopy(updatedResponse);
      dispatch(setReportList(updatedResponse));
      setShowColdStart(response.reports.length === 0);
    });
  }, [dispatch]);

  useEffect(() => {
    dispatch(setShowFreshChatButton(true));
  }, [dispatch]);

  useEffect(() => {
    if (showFilterSlideover) {
      logEvent('OnADFilterReportsView');
    }
  }, [showFilterSlideover]);

  return {
    isOpen,
    isLoading,
    showBanner,
    activeVersion,
    isPaywallFreeOfferModalShowing,
    isSidebarCollapsed,
    isMergeDisabled,
    userId,
    reportList: reportListCopy,
    lookupList: reportList,
    selectedReportsLength,
    searchInput,
    resetSelection,
    onInputValueChange,
    onReportConsolidateButtonClick,
    onVersionSelect,
    handleClose,
    showColdStart,
    showExtButtonTooltip,
    setShowExtButtonTooltip,
    onGrowthModalClose,
    showPriorityBanner,
    onReportClick,
    columns,
    handleOpenFilterSlideover,
    handleCloseFilterSlideover,
    showFilterSlideover,
    filters,
    setReportListCopy,
    setAppliedFilters,
    appliedFilters,
    removeAllFilter,
    toolkitOnLive,
    handleNewTestClick,
    showDeleteScanModal,
    setShowDeleteScanModal,
    handleDeleteReport,
    activeRowId,
    setActiveRowId
  };
}
