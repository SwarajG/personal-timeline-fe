import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  getIsPriorityBannerVisible,
  getShowBanner
} from 'features/Dashboard/slices/selectors';
import {
  resetFilters,
  resetIntermediateFilters,
  resetIssueItem,
  setIntermediateReportFiltersKey,
  setReportFiltersKey,
  setShowHiddenIssues
} from 'features/ManualTest/components/TestReport/slice/appSlice';
import {
  getReportData,
  getReportMetaData
} from 'features/ManualTest/components/TestReport/slice/selector';
import { updateUrlWithQueryParam } from 'utils/helper';

export default function useSummary() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const reportMetaData = useSelector(getReportMetaData);
  const reportData = useSelector(getReportData);
  const showBanner = useSelector(getShowBanner);
  const showPriorityBanner = useSelector(getIsPriorityBannerVisible);

  const getHiddenIssuesCount = () => {
    let hiddenIssues = 0;
    let needsReviewIssues = 0;

    reportData.forEach((data) => {
      data.nodes.forEach((node) => {
        node.childNodes.forEach((item) => {
          if (item.hidden) {
            hiddenIssues += 1;
          }
        });
        if (node.confirmed === null) {
          needsReviewIssues += 1;
        }
      });
    });
    if (hiddenIssues < 10) {
      hiddenIssues = `0${hiddenIssues}`;
    }

    if (needsReviewIssues < 10) {
      needsReviewIssues = `0${needsReviewIssues}`;
    }
    return { hiddenIssues, needsReviewIssues };
  };

  const onRowClick = (filter, value, shouldShowNeedsReviewIssues = false) => {
    const values = shouldShowNeedsReviewIssues || [value];
    dispatch(resetFilters());
    dispatch(setShowHiddenIssues({ hideIssues: false }));
    dispatch(resetIntermediateFilters());
    dispatch(setReportFiltersKey({ key: filter, values }));
    dispatch(setIntermediateReportFiltersKey({ key: filter, values }));

    // append filter to url as query param
    const path = updateUrlWithQueryParam({ [filter]: value.value });
    navigate(`?${path}`);
    document.querySelector('button[value="All issues"]').click();
  };

  const onHiddenIssueClick = () => {
    dispatch(setShowHiddenIssues({ hideIssues: true }));
    dispatch(resetFilters());
    dispatch(resetIntermediateFilters());
    dispatch(resetIssueItem());
    const path = updateUrlWithQueryParam({ hideIssues: true });
    navigate(`?${path}`);
    document.querySelector('button[value="All issues"]').click();
  };

  const getContainerHeight = () => {
    if (showBanner || showPriorityBanner) {
      return 'calc(100vh - 316px)';
    }
    return 'calc(100vh - 250px)';
  };

  return {
    reportMetaData,
    onRowClick,
    onHiddenIssueClick,
    getHiddenIssuesCount,
    getContainerHeight
  };
}
