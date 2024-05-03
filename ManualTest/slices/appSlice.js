import { getStorage } from '@browserstack/utils';
import { createSlice } from '@reduxjs/toolkit';
import { versions } from 'constants';

const { actions, reducer } = createSlice({
  name: 'reportListing',
  initialState: {
    reportList: [],
    activeVersion: versions[0].value,
    selectedReportType: [],
    isShowingBanner: !getStorage('showed-extension-banner')
  },
  reducers: {
    setReportList: (state, { payload }) => {
      state.reportList = payload;
    },
    setIsReportSelected: (state, { payload }) => {
      const { id, isSelected } = payload;
      state.reportList = state.reportList.map((report) =>
        report.uniqueId === id ? { ...report, isSelected } : report
      );
    },
    setActiveVersion: (state, { payload }) => {
      state.activeVersion = payload;
      state.reportList = state.reportList.map((report) => ({
        ...report,
        isSelected: false
      }));
    },
    resetReportSelection: (state) => {
      state.reportList = state.reportList.map((report) => ({
        ...report,
        isSelected: false
      }));
    },
    resetReportApp: (state) => {
      state.reportList = [];
      state.activeVersion = versions[0].value;
    },
    setSelectedReportType: (state, { payload }) => {
      state.selectedReportType = payload;
    },
    setIsShowingBanner: (state, { payload }) => {
      state.isShowingBanner = payload;
    }
  }
});

export const {
  setReportList,
  setIsReportSelected,
  setActiveVersion,
  resetReportSelection,
  resetReportApp,
  setSelectedReportType,
  setIsShowingBanner
} = actions;

export default reducer;
