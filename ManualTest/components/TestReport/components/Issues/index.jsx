import React from 'react';
import { Button } from '@browserstack/design-stack';
import { MdArrowBack } from '@browserstack/design-stack-icons';
import { twClassNames } from '@browserstack/utils';
import IssuesNotFound from 'assets/not_found.svg';
import IssueDetails from 'common/IssueDetails';
import ViolationList from 'common/ViolationList';
import { EXPERIMENTAL_TAG, issueTabs, severityOptions } from 'constants';

import { AllIssueTabs } from './AllIssueTabs';
import { Filters } from './Filters';
import { FilterView } from './FilterView';
import useIssues from './useIssues';

export default function Issues() {
  const {
    activeSwitch,
    onTabSelect,
    filterOptions,
    appliedFilters,
    isFilterModalVisible,
    toggleFilterModal,
    onUpdateImpact,
    onSubmitFilters,
    onHiddenIssueClick,
    showEmptyScreen,
    showHiddenIssues,
    hasFilters,
    onTagClose,
    getIssueHeight,
    isHalfView,
    violations,
    activeComponentList,
    activeComponentId,
    activeViolationId,
    onComponentClick,
    onClickViolation,
    selectedIssue,
    activeIssueIndex,
    onIssueClose,
    wcagVersion,
    totalIssueCount,
    customData,
    issueLink,
    onChangeIssueIndex,
    isShowingIssue,
    issueDetailsContainerRef,
    activeViolation,
    isGuidelineMode,
    nodeNeedsReviewStatusInReports,
    onClickLearnMore,
    onShareIssueClick,
    extraEventPayload,
    isConsolidatedReport,
    engineInfo
  } = useIssues();

  return (
    <>
      <div className="border-b border-base-200 bg-base-50">
        <div className="flex w-full items-center justify-between px-6 py-4">
          {showHiddenIssues && (
            <Button
              colors="white"
              onClick={() => onHiddenIssueClick(false)}
              size="small"
              icon={<MdArrowBack className="text-xl" />}
              wrapperClassName="mr-4"
              isIconOnlyButton
              ariaLabel="Back"
            />
          )}
          <AllIssueTabs
            activeTab={activeSwitch}
            issueTabs={issueTabs}
            onTabSelect={onTabSelect}
          />
          <Filters
            severityOptions={severityOptions}
            filtersData={filterOptions}
            appliedFilters={appliedFilters}
            isFilterModalVisible={isFilterModalVisible}
            toggleFilterModal={toggleFilterModal}
            onSubmit={onSubmitFilters}
            onUpdateImpact={onUpdateImpact}
            hasFilters={hasFilters}
            onHiddenIssueClick={onHiddenIssueClick}
            showHiddenIssues={showHiddenIssues}
          />
        </div>

        {(showHiddenIssues || hasFilters) && (
          <FilterView
            appliedFilters={appliedFilters}
            onTagClose={onTagClose}
            onHiddenIssueClick={onHiddenIssueClick}
            showHiddenIssues={showHiddenIssues}
          />
        )}
      </div>
      <div>
        <>
          {showEmptyScreen ? (
            <div
              className="flex w-full items-center justify-center"
              style={{
                height: 'calc(100vh - 350px)'
              }}
            >
              <div className="flex flex-col items-center justify-center">
                <img
                  src={IssuesNotFound}
                  alt="No Issues Found"
                  className="w-80"
                />
                <p className="mt-4 text-sm text-base-500">No Issues Found</p>
              </div>
            </div>
          ) : (
            <div className="w-full" style={{ height: getIssueHeight() }}>
              <div className="flex h-full w-full">
                <div
                  className={twClassNames(
                    'w-full overflow-auto border-r border-base-200 bg-base-50 pb-20',
                    {
                      'w-2/4': isHalfView
                    }
                  )}
                >
                  <ViolationList
                    violationList={violations}
                    componentList={activeComponentList}
                    activeComponentId={activeComponentId}
                    activeViolationId={activeViolationId}
                    onComponentClick={onComponentClick}
                    onAccordionClick={() => null}
                    retry={false}
                    callback={() => null}
                    openViolationItemId={activeViolationId}
                    setOpenViolationItemId={onClickViolation}
                  />
                </div>
                <div
                  className={twClassNames({
                    'w-2/4': isHalfView
                  })}
                  ref={issueDetailsContainerRef}
                >
                  {isHalfView && (
                    <div className="bg-white">
                      <IssueDetails
                        componentId={activeComponentId}
                        issueItem={selectedIssue}
                        tags={
                          isGuidelineMode
                            ? activeViolation?.tags.filter(
                                (tag) =>
                                  tag === activeViolation.id ||
                                  tag === EXPERIMENTAL_TAG
                              )
                            : activeViolation?.tags
                        }
                        activeIssueIndex={activeIssueIndex}
                        totalIssueCount={totalIssueCount}
                        showRetry={false}
                        showIssue={isShowingIssue}
                        onIssueClose={onIssueClose}
                        callBack={() => null}
                        showSkeleton={false}
                        onNextClick={onChangeIssueIndex}
                        onPreviousClick={onChangeIssueIndex}
                        issueLink={issueLink}
                        hasFilters={hasFilters}
                        customData={customData}
                        wcagVersion={wcagVersion}
                        componentName={
                          isConsolidatedReport
                            ? 'Consolidated'
                            : 'Manual Report'
                        }
                        nodeNeedsReviewStatus={nodeNeedsReviewStatusInReports}
                        showReviewMessageOnExtension
                        onClickLearnMore={onClickLearnMore}
                        onShareIssueClick={onShareIssueClick}
                        extraEventPayload={extraEventPayload()}
                        engineInfo={engineInfo}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      </div>
    </>
  );
}
