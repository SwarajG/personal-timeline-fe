import { createSlice } from '@reduxjs/toolkit';
import { activeInitFilters, ISSUE_TYPE, ISSUES, SUMMARY } from 'constants';

const formatComponentIdString = (componentId) =>
  `${componentId.split('#')[0].toLowerCase()}${
    componentId.split('#')[1] ? `.${componentId.split('#')[1]}` : ''
  }`;

const initialParamState = {
  activeTab: SUMMARY,
  activeSwitch: ISSUE_TYPE,
  defaultIndex: 0,
  activeViolationId: '',
  activeComponentId: '',
  isShowingIssue: false,
  openAccordionId: '',
  activeIssueIndex: 0,
  showHiddenIssues: { hideIssues: false },
  activeFilters: { ...activeInitFilters },
  intermediateFilters: { ...activeInitFilters }
};

const initialAppState = {
  isActiveOpen: false,
  showHiddenIssues: { hideIssues: false },
  activeFilters: { ...activeInitFilters },
  intermediateFilters: { ...activeInitFilters }
};

const getInitialTab = () => {
  const params = new URLSearchParams(window.location.search);
  const activeTab = params.get('activeTab');
  const activeSwitch = params.get('activeSwitch');
  const activeViolationId = params.get('activeViolationId');
  const activeComponentId = params.get('activeComponentId');
  const activeIssueIndex = params.get('activeIssueIndex');
  const isShowingIssue = params.get('isShowingIssue');
  const showHiddenIssues = { hideIssues: params.get('hideIssues') === 'true' };

  // filters
  const activeFilters = {
    ...activeInitFilters,
    showNeedsReviewIssues: params.get('showNeedsReviewIssues') === 'true'
  };

  if (params.get('impact')) {
    activeFilters.impact = params
      .get('impact')
      .split(',')
      .map((value) => ({ label: value, value }));
  }

  if (params.get('page')) {
    activeFilters.page = params
      .get('page')
      .split(',')
      .map((value) => ({ label: value, value }));
  }

  if (params.get('component')) {
    activeFilters.component = params
      .get('component')
      .split(',')
      .map((value) => ({ label: formatComponentIdString(value), value }));
  }

  if (params.get('category')) {
    activeFilters.category = params
      .get('category')
      .split(',')
      .map((value) => ({ label: value, value }));
  }

  const result = { ...initialParamState, showHiddenIssues };
  if (activeTab && activeTab === ISSUES) {
    result.activeTab = ISSUES;
    result.defaultIndex = 1;
    result.activeSwitch = activeSwitch || ISSUE_TYPE;
    result.activeViolationId = activeViolationId;
    result.openAccordionId = activeViolationId;
    result.activeComponentId = activeComponentId;
    if (activeIssueIndex) {
      result.activeIssueIndex = parseInt(activeIssueIndex, 10);
    }
    result.isShowingIssue = isShowingIssue;
    result.activeFilters = activeFilters;
    result.intermediateFilters = activeFilters;
  }

  if (activeTab && activeTab === SUMMARY) {
    result.activeTab = SUMMARY;
    result.defaultIndex = 0;
  }

  return result;
};

const { actions, reducer } = createSlice({
  name: 'reportApp',
  initialState: {
    ...initialAppState,
    ...getInitialTab()
  },
  reducers: {
    setShowHiddenIssues: (state, { payload }) => {
      state.showHiddenIssues = payload;
    },
    setActiveComponentId: (state, { payload }) => {
      state.activeIssueIndex = 0;
      state.activeComponentId = payload;
    },
    setActiveIssueIndex: (state, { payload }) => {
      state.activeIssueIndex = payload;
    },
    setActiveViolationId: (state, { payload }) => {
      state.activeViolationId = payload;
    },
    setIsShowingIssue: (state, { payload }) => {
      state.isShowingIssue = payload;
      if (!payload) {
        state.activeIssueIndex = 0;
      }
    },
    setActiveTab: (state, { payload }) => {
      state.activeTab = payload;
    },
    setActiveSwitch: (state, { payload }) => {
      state.activeSwitch = payload;
      state.isShowingIssue = false;
      state.activeComponentId = '';
      state.activeIssueIndex = 0;
    },
    setOpenAccordionId: (state, { payload }) => {
      state.openAccordionId = payload;
    },
    setReportFilters: (state, { payload }) => {
      state.activeFilters = payload;
    },
    setReportFiltersKey: (state, { payload }) => {
      state.activeFilters[payload.key] = payload.values;
    },
    setResetFilterKey: (state, { payload }) => {
      state.activeFilters[payload.key] = payload.value;
    },
    resetFilters: (state) => {
      state.activeFilters = { ...activeInitFilters };
    },
    setIntermediateReportFiltersKey: (state, { payload }) => {
      state.intermediateFilters[payload.key] = payload.values;
    },
    resetIntermediateResetFilterKey: (state, { payload }) => {
      state.intermediateFilters[payload.key] = payload.value;
    },
    resetIntermediateFilters: (state) => {
      state.intermediateFilters = { ...activeInitFilters };
    },
    resetIntermediateFiltersToActiveFilters: (state) => {
      Object.entries(state.activeFilters).forEach(([key, value]) => {
        state.intermediateFilters[key] = value;
      });
    },
    resetReportAppInfo: (state) => {
      const initState = { ...initialParamState, ...initialAppState };
      Object.entries(initState).forEach(([key, value]) => {
        state[key] = value;
      });
    },
    resetIssueItem: (state) => {
      const resetInitState = {
        activeViolationId: '',
        activeComponentId: '',
        isShowingIssue: false,
        openAccordionId: '',
        activeIssueIndex: 0
      };
      Object.entries(resetInitState).forEach(([key, value]) => {
        state[key] = value;
      });
    },
    resetActiveTab: (state) => {
      state.activeTab = SUMMARY;
    }
  }
});

export const {
  setShowHiddenIssues,
  setActiveComponentId,
  setActiveIssueIndex,
  setActiveViolationId,
  setIsShowingIssue,
  setActiveTab,
  setActiveSwitch,
  setOpenAccordionId,
  setReportFilters,
  setReportFiltersKey,
  setResetFilterKey,
  setIntermediateReportFiltersKey,
  resetIntermediateResetFilterKey,
  resetIntermediateFilters,
  resetIntermediateFiltersToActiveFilters,
  resetFilters,
  resetReportAppInfo,
  resetIssueItem,
  resetActiveTab
} = actions;

export default reducer;
