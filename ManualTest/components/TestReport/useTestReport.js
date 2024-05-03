import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useMountEffect } from '@browserstack/hooks';
import { getStorage, setStorage } from '@browserstack/utils';
import {
  deleteAssitiveScanReport,
  deleteWorkflowScanReport
} from 'api/deleteReport';
import fetchCustomData from 'api/fetchCustomData';
import fetchReport from 'api/fetchReport';
import { events, ISSUE_TYPE, productType, ROUTES } from 'constants';
import {
  getIsPriorityBannerVisible,
  getShowBanner,
  getUser
} from 'features/Dashboard/slices/selectors';
import { setShowFreshChatButton } from 'features/Dashboard/slices/uiSlice';
import { notifyReportDeleted } from 'features/ManualTest';
import {
  setActiveSwitch,
  setActiveTab,
  setOpenAccordionId
} from 'features/ManualTest/components/TestReport/slice/appSlice';
import {
  setCustomData,
  setReportData
} from 'features/ManualTest/components/TestReport/slice/dataSlice';
import {
  getActiveTab,
  getDefaultIndex,
  getReportMetaData
} from 'features/ManualTest/components/TestReport/slice/selector';
import { getShareLinkCTAEventPayload } from 'features/ManualTest/helper';
import { getIsPublicReport } from 'utils';
import { replaceKey, updateUrlWithQueryParam } from 'utils/helper';
import { logEvent } from 'utils/logEvent';

function processSearchParams() {
  const params = new URLSearchParams(window.location.search);
  const reportIDList = params.get('ids')?.split(',');
  const arReportIDList = params.get('ar_ids')?.split(',');
  const reportId =
    reportIDList?.length > 0 ? reportIDList?.[0] : arReportIDList?.[0];
  const reportType = reportIDList?.length > 0 ? 'test' : 'ar';
  const websiteScanList = params.get('wsr_ids')?.split(',');

  return {
    reportId,
    reportType,
    websiteScanList,
    arReportIDList,
    reportIDList
  };
}

export default function useReport() {
  const [isLoading, setIsLoading] = useState(false);
  const [showNewTagPopover, setShowNewTagPopover] = useState();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isPublicReport = getIsPublicReport();
  const defaultIndex = useSelector(getDefaultIndex);
  const reportMetaData = useSelector(getReportMetaData);
  const activeTab = useSelector(getActiveTab);
  const showBanner = useSelector(getShowBanner);
  const { user_id: userId, public_links_enabled: isLinkSharingAllowed } =
    useSelector(getUser);
  const showPriorityBanner = useSelector(getIsPriorityBannerVisible);
  const {
    reportId,
    reportType,
    websiteScanList,
    arReportIDList,
    reportIDList
  } = processSearchParams();

  const idLength = reportIDList?.length || 0;
  const arReportIDLength = arReportIDList?.length || 0;
  const combinedLength =
    (reportIDList?.length ?? 0) + (arReportIDList?.length ?? 0);
  const isConsolidated = combinedLength > 1;

  const isAuthor =
    reportMetaData.meta &&
    reportMetaData?.meta[Object.keys(reportMetaData?.meta)[0]]?.createdBy
      ?.id === userId;

  const needsReviewToggleValue =
    reportMetaData.meta &&
    reportMetaData?.meta[Object.keys(reportMetaData?.meta)[0]]?.needsReview;

  const bestPracticesToggleValue =
    reportMetaData.meta &&
    reportMetaData?.meta[Object.keys(reportMetaData?.meta)[0]]?.bestPractices;

  const getExperimentalToggleValue = () => {
    if (reportMetaData && reportMetaData.meta) {
      const requiredReport =
        reportMetaData?.meta[Object.keys(reportMetaData?.meta)[0]];
      if (requiredReport && requiredReport.a11yCoreConfig) {
        return !requiredReport.a11yCoreConfig
          .disableA11yEngineExperimentalRules;
      }
    }
    return false;
  };

  const onTabChange = (tab) => {
    dispatch(setActiveTab(tab.value));
    dispatch(setActiveSwitch(ISSUE_TYPE));
    dispatch(setOpenAccordionId(''));
    dispatch(setShowFreshChatButton(true));
    logEvent('OnADReportView', {
      actionType: events.CHOOSE_TAB,
      tab: tab.value
    });
    const path = updateUrlWithQueryParam({ activeTab: tab.value });
    navigate(`?${path}`);
  };

  const onCreatePublicLink = () => {
    fetchReport({
      ids: reportIDList,
      arList: arReportIDList,
      websiteScanList
    }).then((reportData) => {
      dispatch(setReportData(reportData));
    });
  };

  const handleCloseNewTagPopover = () => {
    setStorage('showShareLinkNewTagPopover', false);
    setShowNewTagPopover(false);
  };

  const onReportShareLinkClick = () => {
    const isATReport = !isConsolidated && arReportIDLength > 0;
    logEvent('InteractedWithShareLinkCTA', {
      ...getShareLinkCTAEventPayload(isConsolidated, isATReport, 'Report'),
      publicLinkFeatureEnabled: isLinkSharingAllowed
    });
  };

  const getEventPayload = (reportData) => {
    const getTestingType = () => {
      if (!isConsolidated) {
        const firstMetaKey = Object.keys(reportData.meta)[0];
        const firstMeta = reportData.meta[firstMetaKey];
        if (firstMeta && firstMeta.testType === productType.workflowScan) {
          return 'Workflow scanner';
        }
        return 'Assisted test';
      }
      return '';
    };

    const dataObject = {
      reportType: isConsolidated ? 'Consolidated' : 'Individual',
      issueCount: reportData.issueSummary.issueCount,
      pageCount: reportData.issueSummary.pageCount,
      componentCount: reportData.issueSummary.componentCount,
      testingType: getTestingType()
    };

    if (isConsolidated) {
      const consolidatedEngineInfo = Object.values(reportData.meta)
        .filter((meta) => meta.testType === productType.workflowScan)
        .map((meta) => ({
          reportName: meta.name,
          reportId: meta.reportId,
          engineInfo: {
            engineName: meta.engineInfo.testEngine.name,
            engineVersion: meta.engineInfo.testEngine.version
          }
        }));
      dataObject.reportCount = idLength + arReportIDLength;
      dataObject.engineInfoForWorkflowScans = consolidatedEngineInfo;
    } else {
      const firstMetaKey = Object.keys(reportData.meta)[0];
      const firstMeta = reportData.meta[firstMetaKey];
      if (firstMeta.testType === productType.workflowScan) {
        const { engineInfo } = firstMeta;
        dataObject.engineInfo = {
          engineName: engineInfo.testEngine.name,
          engineVersion: engineInfo.testEngine.version
        };
      }
    }
    return dataObject;
  };

  const handleDeleteReport = () => {
    setIsLoading(true);
    logEvent('InteractedWithDeletionModal', {
      tool: 'Manual test reports',
      action: 'Delete report',
      source: 'Report'
    });
    if (reportType === 'test') {
      deleteWorkflowScanReport(reportId).then(() => {
        setIsLoading(false);
        navigate(ROUTES.reports);
        notifyReportDeleted();
      });
    } else if (reportType === 'ar') {
      deleteAssitiveScanReport(reportId).then(() => {
        setIsLoading(false);
        navigate(ROUTES.reports);
        notifyReportDeleted();
      });
    }
  };

  useEffect(() => {
    if (isPublicReport) {
      setShowNewTagPopover(false);
    } else {
      const showShareLinkNewTagPopover = getStorage(
        'showShareLinkNewTagPopover'
      );
      if (showShareLinkNewTagPopover === null) {
        setStorage('showShareLinkNewTagPopover', true);
        setShowNewTagPopover(true);
      } else {
        setShowNewTagPopover(showShareLinkNewTagPopover);
      }
    }
  }, [isPublicReport]);

  useMountEffect(() => {
    setIsLoading(true);
    Promise.all([
      fetchCustomData(),
      fetchReport({
        ids: reportIDList,
        arList: arReportIDList,
        websiteScanList
      })
    ]).then(([customData, reportData]) => {
      dispatch(setCustomData(customData.data));
      dispatch(setReportData(reportData));
      const updatedReportData = replaceKey(reportData, 'meta_v2', 'meta');
      logEvent('OnADReportView', getEventPayload(updatedReportData));
      setIsLoading(false);
    });
  });

  useMountEffect(() => {
    const isATReport = !isConsolidated && arReportIDLength > 0;
    logEvent(
      'OnShareLinkCTA',
      getShareLinkCTAEventPayload(isConsolidated, isATReport, 'Report')
    );
  });

  return {
    activeTab,
    defaultIndex,
    reportId,
    reportType,
    isLoading,
    needsReviewToggleValue,
    bestPracticesToggleValue,
    experimentalToggleValue: getExperimentalToggleValue(),
    showNewTagPopover,
    handleCloseNewTagPopover,
    onReportShareLinkClick,
    isPublicReport,
    reportMetaData,
    isAuthor,
    onTabChange,
    showBanner,
    showPriorityBanner,
    onCreatePublicLink,
    showDeleteModal,
    setShowDeleteModal,
    handleDeleteReport
  };
}
