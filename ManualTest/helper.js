export const getShareLinkCTAEventPayload = (
  isConsolidatedReport,
  isATReport,
  shareType = 'Issue'
) => {
  const payload = {
    subFeature: isATReport ? 'Assisted Test' : 'Workflow Analyser',
    reportType: 'Individual',
    shareType
  };

  if (isConsolidatedReport) {
    payload.reportType = 'Consolidated';
    payload.subFeature = 'Manual report';
  }

  return payload;
};
