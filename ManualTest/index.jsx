import React from 'react';
import {
  Button,
  EmptyState,
  EmptyStateDescription,
  EmptyStateIcon,
  EmptyStateTitle,
  InputField,
  Loader,
  Notifications,
  notify,
  PageHeadings,
  TableCell,
  TableRow,
  Tooltip,
  TooltipBody,
  TooltipHeader
} from '@browserstack/design-stack';
import {
  MdCheckCircleOutline,
  MdClose,
  MdFileDownload,
  MdFilterAlt,
  MdOutlineArrowForward,
  MdSearch,
  MdSearchOff
} from '@browserstack/design-stack-icons';
import { PaywallFreeOfferModal } from '@browserstack/growth';
import { twClassNames } from '@browserstack/utils';
import DeleteScanModal from 'common/DeleteScanModal';
import FilterSlideover from 'common/FilterSlideover';
import AppliedFilters from 'common/FilterSlideover/AppliedFilters';
import { ScrollablePaginatedTable } from 'common/ScrollablePaginatedTable';
import {
  CHROME_EXTENSION_URL,
  DOWNLOAD_EXTENSION_CTA,
  NEW_TEST_CTA
} from 'constants';
import { logEvent } from 'utils/logEvent';

import ColdStart from './components/ColdStart';
import GetStartedModal from './components/GetStartedModal';
import ReportRow from './components/ReportRow';
import useReports from './useReports';

export const notifyReportDeleted = () =>
  notify(
    <Notifications
      title="Report deleted successfully"
      headerIcon={<MdCheckCircleOutline className="h-6 w-6 text-success-400" />}
      handleClose={(toastData) => {
        notify.remove(toastData.id);
      }}
    />,
    {
      position: 'top-right',
      duration: 5000,
      autoClose: true,
      size: 'md'
    }
  );

export default function Reports() {
  const {
    isOpen,
    isLoading,
    isPaywallFreeOfferModalShowing,
    onGrowthModalClose,
    isMergeDisabled,
    selectedReportsLength,
    reportList,
    searchInput,
    resetSelection,
    onInputValueChange,
    onReportConsolidateButtonClick,
    handleClose,
    showBanner,
    showPriorityBanner,
    showColdStart,
    showExtButtonTooltip,
    columns,
    setShowExtButtonTooltip,
    onReportClick,
    handleOpenFilterSlideover,
    showFilterSlideover,
    handleCloseFilterSlideover,
    filters,
    appliedFilters,
    lookupList,
    setReportListCopy,
    removeAllFilter,
    setAppliedFilters,
    toolkitOnLive,
    handleNewTestClick,
    showDeleteScanModal,
    setShowDeleteScanModal,
    handleDeleteReport,
    activeRowId,
    setActiveRowId,
    userId
  } = useReports(notifyReportDeleted);
  const tableHeight = Object.keys(appliedFilters).length
    ? 'calc(100vh - 295px)'
    : 'calc(100vh - 250px)';
  const styleData = {
    height: `${
      showBanner || showPriorityBanner ? 'calc(100vh - 320px)' : tableHeight
    }`
  };

  const searchFilterList = searchInput
    ? reportList.filter(
        ({ name, createdBy: { name: userName } }) =>
          userName.toLowerCase().includes(searchInput.toLowerCase()) ||
          name.toLowerCase().includes(searchInput.toLowerCase())
      )
    : reportList;

  if (isLoading) {
    return (
      <div
        className="flex items-center justify-center"
        style={{
          height: `${
            showBanner || showPriorityBanner
              ? 'calc(100vh - 130px)'
              : 'calc(100vh - 64px)'
          }`
        }}
      >
        <Loader
          variant="loader"
          size="large"
          wrapperClassName="text-base-200 fill-brand-600"
          showLabel
          labelPlacement="bottom"
          label="Fetching details"
        />
      </div>
    );
  }

  const EmptyScreen = () => (
    <div
      className={twClassNames(
        'flex h-[calc(100vh-360px)] items-center justify-center bg-base-50'
      )}
    >
      <EmptyState>
        <EmptyStateIcon>
          <MdSearchOff className="h-12 w-12" />
        </EmptyStateIcon>
        <EmptyStateTitle wrapperClassName="text-lg leading-7">
          No matching results found
        </EmptyStateTitle>
        <EmptyStateDescription wrapperClassName="flex flex-col items-center">
          We couldn&apos;t find the result you were looking for.
          <Button
            onClick={removeAllFilter}
            colors="white"
            wrapperClassName="mt-6"
            size="default"
            ariaLabel="View all reports"
          >
            View all reports
          </Button>
        </EmptyStateDescription>
      </EmptyState>
    </div>
  );

  const renderActions = () => (
    <>
      {!showColdStart && (
        <>
          {toolkitOnLive ? (
            <Button
              iconPlacement="start"
              onClick={handleNewTestClick}
              size="small"
              wrapperClassName="py-2"
            >
              {NEW_TEST_CTA}
            </Button>
          ) : (
            <Tooltip
              show={showExtButtonTooltip && !isPaywallFreeOfferModalShowing}
              placementAlign="end"
              placementSide="bottom"
              arrowPadding={10}
              content={
                <>
                  <TooltipHeader>
                    Start your Accessibility testing!{' '}
                    <span role="img" aria-label="rocket emoji">
                      🚀
                    </span>
                  </TooltipHeader>
                  <TooltipBody>
                    Use the extension to scan your web pages & workflows for
                    accessibility issues.
                  </TooltipBody>
                </>
              }
              theme="dark"
              onMouseLeave={() => {
                logEvent('OnManualTestReportsDownloadExtensionTooltip');
              }}
              onOpenChange={() => setShowExtButtonTooltip((state) => !state)}
              delay={1000}
            >
              <Button
                iconPlacement="start"
                icon={<MdFileDownload className="h-5 w-5 text-base-500" />}
                onClick={() => {
                  window.open(CHROME_EXTENSION_URL, '_target');
                  logEvent('ClickedOnDownloadExtensionCTA', {
                    source: 'Manual test reports',
                    noReports: searchFilterList.length === 0
                  });
                }}
                size="small"
                colors="white"
                wrapperClassName="py-2"
              >
                {DOWNLOAD_EXTENSION_CTA}
              </Button>
            </Tooltip>
          )}
        </>
      )}
    </>
  );

  const renderSubHeading = () => (
    <div className="mt-2">
      <p className="line-clamp-1 text-sm font-medium text-base-500">
        Select reports to view them. You can select more than one report to
        consolidate and review reports.
      </p>
    </div>
  );

  return (
    <>
      <GetStartedModal isOpen={isOpen} handleClose={handleClose} />
      <div className="w-full border-base-200 bg-white">
        <PageHeadings
          actions={renderActions()}
          heading="Manual test reports"
          subSection={renderSubHeading()}
        />
      </div>
      {!showColdStart ? (
        <div
          className="w-full overflow-visible border-t border-base-200"
          style={styleData}
        >
          <div className="h-full w-full px-6">
            <div className="mb-4 mt-6 flex items-center justify-between">
              <div className="flex items-center">
                <Tooltip
                  theme="dark"
                  placementAlign="center"
                  placementSide="bottom"
                  content={
                    isMergeDisabled && (
                      <TooltipBody wrapperClassName="text-center w-56 text-sm text-base-300">
                        Select at least two reports to consolidate them
                      </TooltipBody>
                    )
                  }
                >
                  <Button
                    iconPlacement="end"
                    icon={<MdOutlineArrowForward className="text-xl" />}
                    onClick={onReportConsolidateButtonClick}
                    disabled={isMergeDisabled}
                    size="default"
                    variant="secondary"
                  >
                    Consolidate reports
                  </Button>
                </Tooltip>
                {selectedReportsLength > 0 && (
                  <Button
                    iconPlacement="end"
                    icon={<MdClose className="text-xl" />}
                    onClick={resetSelection}
                    wrapperClassName="ml-4"
                    variant="minimal"
                    colors="white"
                  >
                    Clear {selectedReportsLength} selected
                  </Button>
                )}
              </div>
              <div className="flex items-center justify-between">
                <InputField
                  id="search-report"
                  addOnBeforeInline={
                    <MdSearch className="text-xl text-base-400" />
                  }
                  placeholder="Search for report name or user..."
                  onChange={onInputValueChange}
                  wrapperClassName="mr-4 w-80 bg-white"
                  aria-describedby=""
                />
                <Button
                  icon={<MdFilterAlt className="text-xl" />}
                  colors="white"
                  size="default"
                  onClick={handleOpenFilterSlideover}
                >
                  Filters
                </Button>
              </div>
            </div>
            {Object.keys(appliedFilters).length > 0 ? (
              <AppliedFilters
                filters={appliedFilters}
                onTagClick={handleOpenFilterSlideover}
                appliedFilters={appliedFilters}
                originalData={lookupList}
                setData={setReportListCopy}
                setAppliedFilters={setAppliedFilters}
              />
            ) : null}
            {searchFilterList.length > 0 ? (
              <ScrollablePaginatedTable
                data={searchFilterList}
                style={{ ...styleData, overflowX: 'hidden' }}
                defaultItemHeight={10}
                handleRowClick={(item, e) => onReportClick(e, item)}
                tableProps={{ useEnhancedKeyboardNavigation: true }}
                fixedHeaderContent={() => (
                  <TableRow>
                    <TableCell
                      variant="header"
                      wrapperClassName="border-t border-base-200 py-3 text-xs font-medium tracking-[0.6px] text-base-500 before:absolute before:left-[-1px] before:top-[-1px] before:block before:h-[6px] before:w-[1px] before:rounded before:bg-base-50 first:rounded-tl-lg first:border-l last:rounded-tr-lg last:border-r"
                      isSticky
                    />
                    {columns.map((col) => (
                      <TableCell
                        key={col.key}
                        variant="header"
                        textTransform="uppercase"
                        isSticky
                        wrapperClassName={twClassNames(
                          'border-t border-base-200 py-3 text-xs font-medium tracking-[0.6px] text-base-500 before:absolute before:left-[-1px] before:top-[-1px] before:block before:h-[6px] before:w-[1px] before:rounded before:bg-base-50 first:rounded-tl-lg first:border-l last:rounded-tr-lg last:border-r',
                          {
                            'hidden [@media(min-width:1400px)]:table-cell':
                              col.key === 'severity',
                            '[@media(max-width:1399px)]:border-r':
                              col.key === 'summary'
                          }
                        )}
                      >
                        {col.name}
                      </TableCell>
                    ))}
                  </TableRow>
                )}
                itemContent={(_, row) => (
                  <ReportRow
                    row={row}
                    id={row.uniqueId}
                    userId={userId}
                    activeRowId={activeRowId}
                    setShowDeleteScanModal={setShowDeleteScanModal}
                    setActiveRowId={setActiveRowId}
                  />
                )}
                tableId="filter-list-table"
              />
            ) : (
              <EmptyScreen />
            )}
          </div>
          <DeleteScanModal
            heading="Delete report"
            subHeading="Are you sure you want to delete this report? This action cannot be undone."
            ctaButtonText="Delete report"
            showDeleteScanModal={showDeleteScanModal}
            setShowDeleteScanModal={setShowDeleteScanModal}
            handleDeleteScan={handleDeleteReport}
            isLoading={isLoading}
            onCancel={() => {
              logEvent('InteractedWithDeletionModal', {
                tool: 'Manual test reports',
                action: 'Cancel',
                source: 'Listing'
              });
            }}
          />
        </div>
      ) : (
        <div
          className="flex w-full flex-col items-center justify-center"
          style={{
            height: 'calc(100vh - 291px)'
          }}
        >
          <ColdStart />
        </div>
      )}
      {!isOpen && (
        <PaywallFreeOfferModal
          onModalClose={(isGrowthModalOpen) => {
            onGrowthModalClose(isGrowthModalOpen);
          }}
        />
      )}
      <FilterSlideover
        show={showFilterSlideover}
        handleClose={handleCloseFilterSlideover}
        filters={filters}
        appliedFilters={appliedFilters}
        originalData={lookupList}
        setAppliedFilters={setAppliedFilters}
        setData={setReportListCopy}
      />
    </>
  );
}
