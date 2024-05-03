import { createSlice } from '@reduxjs/toolkit';

const { actions, reducer } = createSlice({
  name: 'reportData',
  initialState: {
    reportData: null,
    customData: null,
    reportMetaData: {
      issueSummary: {},
      meta: {},
      chartData: {}
    }
  },
  reducers: {
    setReportData: (state, { payload }) => {
      const {
        reportData,
        issueSummary,
        meta_v2: metaV2,
        chartData,
        publicLink
      } = payload;
      state.reportData = reportData;
      state.reportMetaData = {
        issueSummary,
        meta: metaV2,
        chartData,
        publicLink
      };
    },
    setCustomData: (state, { payload }) => {
      state.customData = payload;
    },
    resetReportData: (state) => {
      state.reportData = null;
      state.reportMetaData = {
        issueSummary: null,
        meta: null,
        chartData: null
      };
    }
  }
});

export const { setReportData, setCustomData, resetReportData } = actions;

export default reducer;
