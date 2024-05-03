import React from 'react';
import { useSelector } from 'react-redux';
import {
  Badge,
  BreadcrumbContainer,
  BreadcrumbContents,
  BreadcrumbText,
  Button,
  Hyperlink,
  Loader,
  PageHeadings,
  Popover,
  PopoverHeader,
  Tag,
  TooltipBody,
  TooltipHeader
} from '@browserstack/design-stack';
import {
  MdClose,
  MdDownload,
  MdExpandMore,
  MdOutlineDeleteOutline,
  MdPerson,
  MdSchedule
} from '@browserstack/design-stack-icons';
import DeleteScanModal from 'common/DeleteScanModal';
import PublicLink from 'common/PublicLink';
import { ISSUES, productType, SUMMARY } from 'constants';
import format from 'date-fns/format';
import { getReportData } from 'features/ManualTest/components/TestReport/slice/selector';
import { downloadCsv, generateReportUrl } from 'utils/helper';
import { logEvent } from 'utils/logEvent';

import Issues from './components/Issues';
import ReportNamePopOver from './components/ReportNamePopover';
import Summary from './components/Summary';
import useReport from './useTestReport';

const tabList = [
  {
    name: 'Summary',
    value: SUMMARY
  },
  {
    name: 'All issues',
    value: ISSUES
  }
];

const getCsvName = (isSingleReport, reportMetaData, reportsLength) =>
  isSingleReport
    ? `${Object.values(reportMetaData.meta)[0].name}-${format(
        new Date(),
        'dd-MM-yyyy'
      )}`
    : `Consolidated_report[${reportsLength}]-${format(
        new Date(),
        'dd-MM-yyyy'
      )}`;

export default function Report() {
  const {
    activeTab,
    defaultIndex,
    isLoading,
    reportMetaData,
    onTabChange,
    isPublicReport,
    needsReviewToggleValue,
    bestPracticesToggleValue,
    showNewTagPopover,
    reportId: reportID,
    reportType,
    onReportShareLinkClick,
    isAuthor,
    onCreatePublicLink,
    showDeleteModal,
    setShowDeleteModal,
    handleDeleteReport,
    experimentalToggleValue,
    handleCloseNewTagPopover
  } = useReport();
  const reportData = useSelector(getReportData);
  const reportsLength = reportData && Object.keys(reportMetaData.meta).length;

  const isSingleReport = reportsLength === 1;

  const csvName = getCsvName(isSingleReport, reportMetaData, reportsLength);

  const reportName = isSingleReport
    ? Object.values(reportMetaData.meta)[0].name
    : `Consolidated report across ${reportsLength} reports`;

  const flattenedReportsMeta = reportData
    ? Object.entries(reportMetaData.meta)
    : [];

  const params = new URLSearchParams(window.location.search);
  const type = params.get('type');

  if (!reportData || !reportMetaData?.chartData || isLoading) {
    return (
      <div className="flex h-screen flex-col items-center justify-center">
        <Loader
          variant="loader"
          size="large"
          wrapperClassName="text-base-200 fill-brand-600"
          label="Fetching report"
          labelPlacement="bottom"
          showLabel
        />
      </div>
    );
  }

  const renderBreadcrumbNode = () =>
    !isPublicReport ? (
      <BreadcrumbContainer>
        <BreadcrumbContents>
          <Hyperlink href="/reports">
            <BreadcrumbText>All reports</BreadcrumbText>
          </Hyperlink>
        </BreadcrumbContents>
        <BreadcrumbContents isActive>
          <BreadcrumbText isActive>
            {isSingleReport
              ? Object.values(reportMetaData.meta)[0].name
              : 'Consolidated report'}
          </BreadcrumbText>
        </BreadcrumbContents>
      </BreadcrumbContainer>
    ) : null;

  const renderReportHeading = () =>
    isPublicReport
      ? `${
          type === productType.assistedTest
            ? 'Assisted test'
            : 'Workflow analyzer'
        }: ${reportName}`
      : reportName;

  const renderPopoverContents = () => (
    <PopoverHeader className="px-4">
      <p className="my-1 text-sm font-medium text-base-500">Needs review</p>
      <Tag
        modifier={needsReviewToggleValue ? 'success' : 'error'}
        text={needsReviewToggleValue ? 'ON' : 'OFF'}
        wrapperClassName="rounded-3xl my-1"
      />
      <p className="my-1 text-sm font-medium text-base-500">Best practices</p>
      <Tag
        modifier={bestPracticesToggleValue ? 'success' : 'error'}
        text={bestPracticesToggleValue ? 'ON' : 'OFF'}
        wrapperClassName="rounded-3xl my-1"
      />
      {/* commenting this for now because we will need this when manual extension with a11yEngine goes live  */}
      <p className="my-1 text-sm font-medium text-base-500">
        Experimental Rules
      </p>
      <Tag
        modifier={experimentalToggleValue ? 'success' : 'error'}
        text={experimentalToggleValue ? 'ON' : 'OFF'}
        wrapperClassName="rounded-3xl my-1"
      />
    </PopoverHeader>
  );

  const renderSubSection = () => (
    <div className="mt-2">
      {isSingleReport && (
        <div className="flex items-center gap-6">
          {Object.values(reportMetaData.meta)[0]?.createdBy?.name ? (
            <div className="flex text-sm text-base-500">
              <MdPerson className="text-xl" />
              <p className="ml-1.5">
                {Object.values(reportMetaData.meta)[0]?.createdBy?.name}
              </p>
            </div>
          ) : null}
          {reportMetaData.meta !== null && (
            <div className="flex items-center text-sm text-base-500">
              <MdSchedule className="text-xl" />
              <p className="ml-1.5">
                {format(
                  new Date(
                    Object.values(reportMetaData.meta)[0].startTimestamp
                  ),
                  'MMM dd, yyyy, h:mm a'
                )}
              </p>
            </div>
          )}
          {!!Object.values(reportMetaData.meta)[0].wcagVersion.label && (
            <>
              <Badge
                hasDot={false}
                hasRemoveButton={false}
                text={Object.values(reportMetaData.meta)[0].wcagVersion.label}
                modifier="base"
              />
            </>
          )}
          {isSingleReport &&
          reportMetaData &&
          reportMetaData.meta &&
          reportMetaData?.meta[Object.keys(reportMetaData?.meta)[0]]
            ?.testType === 'workflowScan' ? (
            <Popover
              theme="light"
              placementSide="bottom"
              placementAlign="end"
              arrowWidth={0}
              size="full"
              content={renderPopoverContents()}
            >
              <Button
                colors="white"
                iconPlacement="end"
                icon={<MdExpandMore />}
                onClick={() => {}}
                variant="minimal"
                wrapperClassName="font-medium text-sm text-base-700"
              >
                Scan details
              </Button>
            </Popover>
          ) : null}
        </div>
      )}
      {!isSingleReport && (
        <div className="flex flex-col items-start lg:flex-row lg:items-center">
          {flattenedReportsMeta
            .slice(0, 2)
            .map(([id, { name, reportId, testType }], index) => (
              <div
                key={id}
                className="mr-2 inline-flex max-w-sm items-baseline text-base-500 lg:max-w-[17rem]"
              >
                <Hyperlink
                  target="_blank"
                  href={generateReportUrl(
                    reportId ? `${testType}:${reportId}` : id
                  )}
                  wrapperClassName="inline-grid text-sm font-medium leading-5"
                >
                  <span className="truncate">{name}</span>
                  <span className="sr-only">(opens in a new tab)</span>
                </Hyperlink>
                {index !== 1 && flattenedReportsMeta.length <= 2 && ','}
                {flattenedReportsMeta.length > 2 && ','}
              </div>
            ))}
          {flattenedReportsMeta.length > 2 && (
            <ReportNamePopOver data={flattenedReportsMeta.slice(2)} />
          )}
        </div>
      )}
    </div>
  );

  const renderActions = () => (
    <>
      <div className="flex items-center justify-between">
        <div className="flex">
          <Popover
            theme="dark"
            show={showNewTagPopover}
            onFocusOutside={handleCloseNewTagPopover}
            onInteractOutside={handleCloseNewTagPopover}
            onEscapeKeyDown={handleCloseNewTagPopover}
            placementSide="bottom"
            placementAlign="end"
            size="full"
            wrapperClassName="w-[330px]"
            content={
              !isPublicReport ? (
                <PopoverHeader className="px-4">
                  <TooltipHeader wrapperClassName="flex">
                    <p className="text-sm font-medium text-white">
                      New! Public report sharing is now available
                    </p>
                    <MdClose
                      tabindex={0}
                      aria-label="Close tooltip"
                      onKeyDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if ([' ', 'Enter', 'Tab'].includes(e.key)) {
                          handleCloseNewTagPopover();
                        }
                      }}
                      onClick={handleCloseNewTagPopover}
                      className="h-6 w-6 cursor-pointer text-base-400"
                    />
                  </TooltipHeader>
                  <TooltipBody wrapperClassName="mt-2 text-sm font-normal text-base-300">
                    Effortlessly share reports online via public links,
                    accessible to all users regardless of their account status
                    or login.
                  </TooltipBody>
                </PopoverHeader>
              ) : null
            }
          >
            <div className="max-w-md">
              <PublicLink
                onReportShareLinkClick={onReportShareLinkClick}
                getReportUrl={() => window.location.href}
                reportId={reportID}
                reportType={
                  reportType === 'ar'
                    ? productType.assistedTest
                    : productType.workflowScan
                }
                isSharingEnabled={reportMetaData?.publicLink?.isEnabled}
                currentPublicLink={reportMetaData?.publicLink?.link}
                onLinkChange={onCreatePublicLink}
                isAuthor={isAuthor}
                isConsolidatedReport={!isSingleReport}
              />
            </div>
          </Popover>
          <Button
            icon={<MdDownload className="text-xl" />}
            wrapperClassName="ml-3 font-medium text-sm"
            iconPlacement="start"
            size="large"
            onClick={() => downloadCsv(reportData, csvName)}
          >
            Export
          </Button>
          {isAuthor && isSingleReport && !isPublicReport ? (
            <Button
              isIconOnlyButton
              colors="white"
              icon={<MdOutlineDeleteOutline className="text-xl" />}
              wrapperClassName="ml-3"
              aria-label="Delete this report"
              onClick={() => {
                logEvent('OnDeletionModal', {
                  tool: 'Manual test reports',
                  source: 'Report'
                });
                setShowDeleteModal(true);
              }}
            />
          ) : null}
        </div>
      </div>
    </>
  );

  return (
    <div className="h-full bg-base-50">
      <div className="w-full border-b border-base-200 bg-white">
        <PageHeadings
          wrapperClassName="px-6 pt-6"
          actions={renderActions()}
          breadcrumbNode={renderBreadcrumbNode()}
          heading={renderReportHeading()}
          subSection={renderSubSection()}
          tabsProps={{
            onTabChange,
            tabsArray: tabList,
            defaultIndex,
            disableFullWidthBorder: true
          }}
        />
      </div>
      {activeTab === 'summary' && <Summary />}
      {activeTab === 'issues' && <Issues />}
      <DeleteScanModal
        heading="Delete report"
        subHeading="Are you sure you want to delete this report? This action cannot be undone."
        ctaButtonText="Delete report"
        showDeleteScanModal={showDeleteModal}
        setShowDeleteScanModal={setShowDeleteModal}
        handleDeleteScan={handleDeleteReport}
        isLoading={isLoading}
        onCancel={() => {
          logEvent('InteractedWithDeletionModal', {
            tool: 'Manual test reports',
            action: 'Cancel',
            source: 'Report'
          });
        }}
      />
    </div>
  );
}
